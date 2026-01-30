# Customer Address Flow — Full Technical Documentation

This document describes the **entire address flow** in the application: what it does, why, how, and where. It is written so that (1) you can understand everything after a week, (2) any new developer can onboard, and (3) AI agents can safely refactor, extend, or add features without missing behavior or corrupting data.

---

## 1. Overview & Architecture

### 1.1 What the address system does

- **Guest (unauthenticated)**: User can add **one** address. It is stored only in the browser (Zustand + `localStorage`). No API is used for listing/saving guest addresses.
- **Authenticated**: User has multiple addresses stored on the server. The app uses React Query to fetch/create/update/delete via the Libero API. One address can be marked **default**.
- **Active delivery address**: Regardless of guest vs auth, the **currently selected** address for the order is kept in `useOrderStore` (order type, delivery address, scheduled time). This is the “delivery to” shown in SubHeader, checkout, and OrderTypeModal.
- **Merge on auth**: When a user **logs in** or **completes signup**, any guest address(es) in `useAddressStore` are sent to the API (one `POST /store/addresses` per address), then local guest addresses are cleared. No background or time-based sync—only at login/signup.

### 1.2 Core technologies

| Layer | Technology | Role |
|-------|------------|------|
| Server state (auth user) | **TanStack Query (React Query)** | Fetch/list/create/update/delete addresses; cache and invalidate. |
| Client state (guest + active order) | **Zustand + persist** | Guest addresses in `useAddressStore`; active order (type, delivery address, time) in `useOrderStore`. Both use `localStorage`. |
| Map & geocoding | **Leaflet**, **Nominatim via `/proxy/nominatim`** | Map in `AddressMap`; search and reverse geocode. Never call Nominatim directly (CORS + `accept-language`). |
| Routing / protection | **Next.js** | `/my-addresses` is under `(protected)` layout; protection is layout-based, not middleware. |
| API client | **fetchLibero / fetchLiberoFull** (in `src/services/api.ts`) | All address API calls go through `storeService` which uses these; protected endpoints send auth cookies. |

### 1.3 Single source of truth

- **List of addresses**:  
  - Guest → `useAddressStore.addresses` (only one).  
  - Auth → Server + React Query cache (key `addressKeys.list()`).
- **Active delivery address**: Always `useOrderStore.deliveryAddress`. When user edits the address that is currently “delivery”, or sets default in My Addresses, the code updates `setDeliveryAddress(...)` so the rest of the app stays in sync.

---

## 2. Data flow by auth state

### 2.1 Guest (not authenticated)

**Where data lives**

- **Guest addresses**: `useAddressStore` → persisted in `localStorage` under key `addresses-storage`.
- **Active delivery address**: `useOrderStore.deliveryAddress` → persisted in `order-storage`.

**Rules**

- **Maximum one guest address.**  
  - `addAddress`: replaces the list with a single item `[newAddress]` (and forces `is_default: true`).  
  - `updateAddress`: same—one item, replaced.  
  - `deleteAddress(id)`: clears the list (ignores `id`).
- **No address API calls** for listing or saving guest addresses. Only when user becomes auth do we call `POST /store/addresses` (merge).

**Where guest address is used**

- **OrderTypeModal**: If `orderType === 'delivery'`, it shows `guestAddresses` from `useAddressStore`. User can add one (opens AddressModal), or edit that one. Saving goes to `addGuestAddress` / `updateGuestAddress` and `setDeliveryAddress`.
- **SubHeader**: Shows delivery summary from `useOrderStore.deliveryAddress`; “Edit” opens OrderTypeModal (same flow).
- **Checkout OrderTypeCard**: Same—reads `deliveryAddress` from `useOrderStore`, “Edit” opens OrderTypeModal.

**Add New visibility (guest)**

- In **OrderTypeModal**: “Add New” is shown only if `displayAddresses.length === 0` **or** user is authenticated. So for guest: button is hidden once they have that one address.
- **SubHeader**: No separate “Add address” button; user goes through OrderTypeModal when they click delivery / Edit.

### 2.2 Authenticated user

**Where data lives**

- **List of addresses**: Server + React Query. Fetched with `useAddresses()` → `storeService.getAddresses(params)`.
- **Active delivery address**: Still `useOrderStore.deliveryAddress` (can be any one of the fetched addresses, or null).

**Rules**

- Multiple addresses; one can be `is_default`.
- All create/update/delete go through API and React Query mutations; cache is invalidated so list stays fresh.
- **Edit by ID**: When opening the edit modal for an address, the app uses **address ID** and fetches that address with `GET /store/addresses/{id}` (via `useAddress(id)`) so the form is filled with up-to-date data, not stale list data.

**Where auth addresses are used**

- **My Addresses page** (`MyAddressesView`): Uses `useAddresses()`, no guest store. Add/Edit/Delete/Set default all go through mutations and sync `useOrderStore.deliveryAddress` when needed.
- **OrderTypeModal**: Uses `apiAddresses` from `useAddresses()`; Add/Edit use create/update mutations and then `setDeliveryAddress(result)`.
- **SubHeader / OrderTypeCard**: Same as guest—they only read `useOrderStore.deliveryAddress`.

---

## 3. When and how sync happens

### 3.1 Guest → account merge (only at login/signup)

**When**

- **Login (existing user)**: Right after OTP is verified in `handleOtpSubmit` (in `useAuthFlowHandlers.ts`). After `setAuth(response.customer, response.token)`, the code runs `Promise.all([mergeGuestCartAfterAuth(), mergeGuestWishlistAfterAuth(), mergeGuestAddressAfterAuth()])`.
- **Signup (new user)**: After profile update in `handleSignupSubmit`. After `setProfile(updatedProfile)`, the same `Promise.all` runs (cart, wishlist, address merge).

**How** (`useAddressMerge.ts`)

1. If `!isAuthenticated` or `addresses.length === 0`, return (no-op).
2. For each address in `useAddressStore.addresses`, build a payload matching `CreateAddressRequest` (label, recipient_name, phone, country_id, city_id, district_id, street, building, unit, postal_code, additional_number, description, is_default, lat/lng, etc.), using fallbacks (e.g. `addr.label || addr.name || 'Home'`).
3. Call `storeService.createAddress(payload)` for each (parallel).
4. On full success: `clearAddresses()` so `addresses-storage` is cleared.
5. On failure: log error; **do not** clear addresses (user can retry later).

**Important**: There is **no** periodic sync, no “after X minutes” sync, and no sync on page load other than the merge that runs once at login/signup.

### 3.2 Keeping “delivery address” in sync after edits

- **MyAddressesView — after update**: If the updated address is the current `deliveryAddress` (same `id`), call `setDeliveryAddress(updated)`.
- **MyAddressesView — after set default**: After `updateAddressMutation.mutateAsync({ id, data: { is_default: true } })`, call `setDeliveryAddress(updated)` so the default becomes the active delivery choice.
- **MyAddressesView — after delete**: If the deleted address is the current `deliveryAddress`, call `setDeliveryAddress(null)` (via `useOrderStore.getState()` to avoid hook rules).
- **OrderTypeModal — after create/update**: After successful mutation, it sets the new/updated address as delivery: `setDeliveryAddress(result)`.

So “sync” here means: **keep `useOrderStore.deliveryAddress` aligned with the last created/updated/default/deleted address when that address is the one used for delivery.**

---

## 4. API endpoints, caching, and data types

### 4.1 Address endpoints (Libero API)

All go through `storeService` in `src/services/store-service.ts`. Base URL is `/proxy` on the client (see `getBaseUrl()` in `api.ts`), so the browser calls e.g. `/proxy/store/addresses`.

| Method | Endpoint | Purpose | Protected |
|--------|----------|---------|-----------|
| GET | `/store/addresses` | List user addresses. Optional query: `default`, `label`. | Yes |
| GET | `/store/addresses/{id}` | Single address (e.g. for edit form). | Yes |
| POST | `/store/addresses` | Create address (used by merge and by “Add address”). | Yes |
| PUT | `/store/addresses/{id}` | Update address. | Yes |
| DELETE | `/store/addresses/{id}` | Delete address. | Yes |

Protected calls send cookies (e.g. `accessToken`) via `getBaseHeaders()` in the API layer.

### 4.2 Location endpoints (countries, cities, districts)

| Method | Endpoint | Purpose | Caching (React Query) |
|--------|----------|---------|------------------------|
| GET | `/store/locations/countries` | List countries | `staleTime: 24h` |
| GET | `/store/locations/cities?country_id=...` | Cities for a country | `staleTime: 24h`, `enabled: !!countryId` |
| GET | `/store/locations/districts?city_id=...` | Districts for a city | `staleTime: 24h`, `enabled: !!cityId` |

In `store-service.ts`, location endpoints use `next: { revalidate: 86400 }` (24h) for server-side fetch; React Query adds client-side caching with 24h staleTime.

### 4.3 React Query keys and invalidation (`useAddresses.ts`)

- `addressKeys.all` → `['addresses']`
- `addressKeys.lists()` → `['addresses', 'list']`
- `addressKeys.list(params)` → `['addresses', 'list', params]`
- `addressKeys.details()` → `['addresses', 'detail']`
- `addressKeys.detail(id)` → `['addresses', 'detail', id]`

**When invalidated**

- **Create address**: `invalidateQueries({ queryKey: addressKeys.all })` → list refetches.
- **Update address**: Invalidate `addressKeys.all` and `addressKeys.detail(variables.id)`.
- **Delete address**: Invalidate `addressKeys.all`.

**When queries run**

- `useAddresses(params)`: `enabled: isAuthenticated`. So guest never triggers GET /addresses.
- `useAddress(id)`: `enabled: isAuthenticated && !!id`, `staleTime: 5 * 60 * 1000` (5 minutes). Used when opening edit modal by ID.

### 4.4 Response and request types (`src/types/address.ts`)

- **Address**: Full shape used across the app (id, label, recipient_name, phone, country_id, city_id, district_id, street, building, unit, postal_code, additional_number, description, is_default, latitude, longitude, formatted, name, notes, city_name, etc.).
- **CreateAddressRequest**: Required: label, phone, country_id, city_id, street. Rest optional (recipient_name, district_id, building, unit, postal_code, additional_number, description, is_default, latitude, longitude).
- **UpdateAddressRequest**: `Partial<CreateAddressRequest>`.
- **Country, City, District**: `{ id: number; name: string }`.

The merge in `useAddressMerge` maps `Address` (guest) to a payload that matches `CreateAddressRequest` (with fallbacks for optional fields).

---

## 5. File-by-file breakdown

### 5.1 Stores

#### `src/store/useAddressStore.ts`

- **What it stores**: `addresses: Address[]`. In practice for guest this is **at most one** item.
- **Persistence**: `localStorage`, key `addresses-storage`, version `ADDRESS_STORAGE_VERSION = 1`.
- **Actions**:
  - `addAddress(address)`: Sets state to `[newAddress]` with `is_default: true` (replaces any existing).
  - `updateAddress(updatedAddress)`: Same—single item, replaced, `is_default: true`.
  - `deleteAddress(id)`: Sets `addresses: []`.
  - `setDefaultAddress(id)`: Maps over addresses and sets `is_default: addr.id === id` (for guest still only one item).
  - `clearAddresses()`: Sets `addresses: []` (used after successful merge).
- **Used by**: OrderTypeModal (guest list + add/update), useAddressMerge (read + clear).

#### `src/store/useOrderStore.ts`

- **What it stores**: `orderType`, `deliveryAddress`, `scheduledTime`, `orderTime`. This is the **active order configuration** (delivery vs pickup/dine-in, which address, now vs later, and when).
- **Persistence**: `order-storage`. `scheduledTime` is persisted as ISO string; restored as string until components call `getScheduledTimeAsDate()`.
- **Relevant to address**: `deliveryAddress` is the single “delivery to” address shown everywhere (SubHeader, OrderTypeModal, OrderTypeCard, MyAddressesView when setting default). When user edits/deletes/sets default, callers use `setDeliveryAddress` to keep this in sync.
- **Helper**: `getScheduledTimeAsDate(scheduledTime)` converts string or Date to `Date | null` (used by OrderTypeModal, OrderTypeCard, SubHeader).

### 5.2 Hooks

#### `src/hooks/useAddresses.ts`

- **What it does**: React Query hooks for addresses and locations. **No Zustand**; only server state and API.
- **useAddresses(params?)**: Query `addressKeys.list(params ?? {})` with `AddressListParams` (`{ default?: boolean; label?: string }`), `storeService.getAddresses(params)`, `enabled: isAuthenticated`. Returns list of addresses (or empty when guest).
- **useAddress(id)**: Query `addressKeys.detail(id)`, `storeService.getAddress(id)`, `enabled: isAuthenticated && !!id`, `staleTime: 5 min`. Used when editing by ID to avoid stale list data.
- **usePrefetchAddress()**: Returns `(id: number) => void` that prefetches that address via `queryClient.prefetchQuery(addressKeys.detail(id))` when authenticated. Used by MyAddressesView on AddressCard `onMouseEnter` so edit modal can open with cached data.
- **useCreateAddress()**: Mutation `storeService.createAddress(data)`. On success: invalidate `addressKeys.all`.
- **useUpdateAddress()**: Mutation `storeService.updateAddress(id, data)`. On success: invalidate `addressKeys.all` and `addressKeys.detail(id)`.
- **useDeleteAddress()**: Mutation `storeService.deleteAddress(id)`. On success: invalidate `addressKeys.all`.
- **useCountries()**: Query countries, 24h staleTime.
- **useCities(countryId)**: Query cities for `countryId`, 24h staleTime, `enabled: !!countryId`.
- **useDistricts(cityId)**: Query districts for `cityId`, 24h staleTime, `enabled: !!cityId`.

#### `src/hooks/useAddressMerge.ts`

- **What it does**: One function, `mergeGuestAddressAfterAuth()`. Reads `useAddressStore.addresses` and `useAuthStore.isAuthenticated`; if authenticated and there are addresses, POSTs each to `storeService.createAddress`, then calls `clearAddresses()`. On error, does not clear (addresses remain for retry).
- **When it’s called**: Only from `useAuthFlowHandlers`—after login (OTP success) and after signup (profile update), in `Promise.all` with cart and wishlist merge.

#### `src/hooks/auth/useAuthFlowHandlers.ts`

- **Address-related**: Imports `useAddressMerge` and calls `mergeGuestAddressAfterAuth()` inside:
  - `handleOtpSubmit`: when `!isNewUser`, after `setAuth(...)`.
  - `handleSignupSubmit`: after `setProfile(updatedProfile)`.
- No other address logic here.

### 5.3 Auth / config

#### `src/lib/auth/constants.ts`

- **Address-related**: `PROTECTED_ROUTES` includes `'/my-addresses'`; `PROTECTED_API_ENDPOINTS` includes `'/store/addresses'`. Used for route protection and for knowing which API calls require auth (middleware or guards may use these; address API uses `isProtected: true` in store-service).

### 5.4 Address helpers (lib/address)

#### `src/lib/address/deliverySync.ts`

- **Role**: Centralized delivery-address sync after mutations. `getNextDeliveryAddressAfterMutation(options)` returns the value to set for `deliveryAddress` given event (`created` | `updated` | `deleted` | `set_default`), address or addressId, current delivery, and (for created) `addressesCountBeforeCreate`. Used by MyAddressesView and OrderTypeModal so they always call `setDeliveryAddress(next)` with the same logic.

#### `src/lib/address/formatAddress.ts`

- **Role**: Shared address display. `getAddressLabel(address)` returns label/name or fallback. `formatAddressForDisplay(address)` returns a single-line string (formatted or street, building, unit, city). `showAddNewAddressButton(isAuthenticated, addressCount)` returns whether to show the “Add New” button (guests only when count is 0). Used by SubHeader, OrderTypeCard, OrderTypeModal, AddressCard.

### 5.5 Modals and map

#### `src/components/modals/ConfirmModal.tsx`

- **Role**: Reusable confirmation dialog. Props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmLabel`, `cancelLabel`, `variant` ('danger' | 'default'), `isLoading`. Used by MyAddressesView for address delete (variant danger, translated strings from MyAddresses).

#### `src/components/modals/AddressModal.tsx`

- **Role**: Central form for add/edit address: fields (label, recipient, phone, country, city, district, street, building, unit, postal code, additional number, notes, is_default), map search, and map click for coordinates.
- **Props**: `isOpen`, `onClose`, `onSave(address: AddressFormSubmitPayload)`, `initialAddress?`, `addressId?`. If `addressId` is set and user is auth, it fetches that address with `useAddress(addressId)` and uses it (or `initialAddress`) to fill the form. So **edit by ID** uses fresh data.
- **State**: Many `useState` fields; `pendingCity` / `pendingDistrict` used because cities load after country and districts after city—when opening edit, we set `selectedCity('')` and `selectedDistrict('')` first, then pending values, so the correct city/district are applied when lists load (comment: “applyPendingWhenOptionsReady”).
- **Validation**: `isValid` = addressName, phone, selectedCountry, selectedCity, street all non-empty. Save button disabled when `!isValid || isFetchingAddress`.
- **Map**: Uses `AddressMap` with `searchQuery`, `selectedLocation`, `onLocationSelect`. Map is lazy-loaded (`dynamic(..., { ssr: false })`). On location select (map click or search), a toast “Location selected” is shown; a “Location selected” card with check icon and formatted address appears above the search field and (compact) below the map.
- **Loading**: When `isFetchingAddress`, a full skeleton matching the form+map grid is shown so the modal doesn’t jump in size; content area has `min-h-[40vh] sm:min-h-[480px]` for stable height.
- **onSave**: Builds an `AddressFormSubmitPayload` and calls `onSave(addressData)`. Parents use `toCreateAddressRequest` / `toUpdateAddressRequest` when calling the API. Parents close the modal immediately (optimistic) then run the mutation in the background.
- **Country/City/District**: Selects use `value={selectedX === '' ? '' : selectedX}` for correct option matching. Styling: ChevronDown icon (end side, RTL-aware), `min-h-[48px]`, `rounded-xl`, focus ring. On edit, city/district are cleared then restored from pending when lists load.
- **Mobile**: Outer wrapper `p-3 sm:p-4 md:p-5` so the modal never touches screen edges. Modal `max-h-[88vh] sm:max-h-[90vh]`, `rounded-xl sm:rounded-2xl md:rounded-3xl`. Map column is `order-first` on mobile so map and “Location selected” appear first. Footer buttons `min-h-[48px]`, `rounded-lg sm:rounded-xl`, `touch-manipulation`.

#### `src/components/modals/OrderTypeModal.tsx`

- **Role**: Modal to choose order type (delivery, dine-in, pickup, car pickup), delivery address (list + add/edit), and order time (now / later with date-time picker).
- **Address source**: `displayAddresses = isAuthenticated ? apiAddresses : guestAddresses`; `apiAddresses` from `useAddresses()`, `guestAddresses` from `useAddressStore`.
- **Default selection**: When modal is open, order type is delivery, and there is no `deliveryAddress` but `displayAddresses.length > 0`, it sets the first address or the one with `is_default` as delivery (`setDeliveryAddress(defaultAddr)`).
- **Add**: `handleAddAddress` opens AddressModal with `editingAddressId = null`, `editingGuestAddress = null`.
- **Edit**: If auth, sets `editingAddressId = address.id` and opens modal (AddressModal will fetch by ID). If guest, sets `editingGuestAddress = address` and passes as `initialAddress`.
- **Save**: `handleAddressSave(addressData)`: modal closes immediately (optimistic), then create/update/guest logic runs in the background; `setDeliveryAddress(getNextDeliveryAddressAfterMutation(...))` and toast on success, toast on error.
- **Add New button**: Shown when `showAddNewAddressButton(isAuthenticated, displayAddresses.length)` is true (guests only when they have no address yet).
- **Mobile**: Outer wrapper `p-3 sm:p-4 md:p-5` so the modal has visible margins. Modal `max-h-[88vh] sm:max-h-[90vh]`, `rounded-xl sm:rounded-2xl md:rounded-3xl`. Content/footer padding `p-4 sm:p-5 md:p-6`. Buttons and address cards use `rounded-lg sm:rounded-xl` on mobile. Save button `min-h-[48px]`, `touch-manipulation`. Close button has 44px touch target.

#### `src/components/modals/AddressMap.tsx`

- **Role**: Leaflet map; click to set location; optional search query to geocode and move map.
- **Props**: `center`, `onLocationSelect(latLng, formatted)`, `searchQuery`.
- **Client-only**: Renders a placeholder until `mounted` is true (and `typeof window !== 'undefined'`), then renders MapContainer. Prevents SSR issues with Leaflet.
- **Click**: On map click, calls `/proxy/nominatim/reverse?format=json&lat=...&lon=...&accept-language=ar`, then `onLocationSelect([lat, lng], display_name || fallback)`.
- **Search**: When `searchQuery` changes, debounced (800ms) request to `/proxy/nominatim/search?format=json&q=...&accept-language=ar`, takes first result and updates map center and marker, calls `onLocationSelect` with that result.
- **Icons**: Uses custom Leaflet marker from `/images/leaflet/...` to avoid default icon issues.

### 5.6 Pages and components

#### `src/app/[locale]/(protected)/my-addresses/page.tsx`

- **Role**: Server component that sets metadata (title, subtitle from `MyAddresses` translations) and renders `MyAddressesView`. The `(protected)` layout ensures only authenticated users reach this page.

#### `src/app/[locale]/(protected)/my-addresses/MyAddressesView.tsx`

- **Role**: Full CRUD for **authenticated** addresses only. Uses `useAddresses()`, no guest store.
- **Add**: `handleAdd` opens AddressModal with `editingAddressId = null`.
- **Edit**: `handleEdit(address)` sets `editingAddressId = address.id` and opens modal; AddressModal uses `addressId={editingAddressId}` and fetches by ID. `usePrefetchAddress()` is passed to AddressCard as `onMouseEnter` so the address is prefetched on hover.
- **Delete**: `handleDeleteClick(id)` sets `deleteTargetId`; ConfirmModal opens. On confirm, `handleDeleteConfirm` runs `deleteAddressMutation.mutateAsync(id)` and `setDeliveryAddress(getNextDeliveryAddressAfterMutation({ event: 'deleted', addressId: id, currentDelivery }))`.
- **Set default**: `handleSetDefault(id)` updates with `{ is_default: true }`, then `setDeliveryAddress(getNextDeliveryAddressAfterMutation({ event: 'set_default', address: updated, currentDelivery }))`.
- **Save**: `handleSave(addressData: AddressFormSubmitPayload)` — if editing, `toUpdateAddressRequest(addressData)` and update mutation, then `setDeliveryAddress(getNextDeliveryAddressAfterMutation({ event: 'updated', ... }))`; if creating, `toCreateAddressRequest(addressData)` and create mutation, then `setDeliveryAddress(getNextDeliveryAddressAfterMutation({ event: 'created', addressesCountBeforeCreate: addresses.length, ... }))`.

#### `src/app/[locale]/(protected)/my-addresses/AddressCard.tsx`

- **Role**: Presentational card for one address. Uses `getAddressLabel(address)` and `formatAddressForDisplay(address)` from `@/lib/address`. Shows label, formatted line, phone, recipient, description/notes; default badge; Edit and Delete buttons. Optional `onMouseEnter` (e.g. for prefetch). Clicking card (when not default) calls `onSetDefault(address.id)`.

#### `src/app/[locale]/(protected)/checkout/components/OrderTypeCard.tsx`

- **Role**: Displays current order type and delivery address + time (or branch for pickup). Reads `useOrderStore` (orderType, deliveryAddress, scheduledTime, orderTime). Uses `getAddressLabel(deliveryAddress)` and `formatAddressForDisplay(deliveryAddress)` for display. “Edit” opens `OrderTypeModal`. Does not touch address store or API directly.

#### `src/components/layouts/SubHeader.tsx`

- **Role**: Shows branch name and order type (dine-in, pickup, delivery). When order type is delivery and `deliveryAddress` exists, shows “Delivery to (label)” and address summary plus “Edit” using `getAddressLabel(deliveryAddress)` and `formatAddressForDisplay(deliveryAddress)`; otherwise shows order type buttons. Clicking “Edit” or choosing delivery opens `OrderTypeModal`. All address data comes from `useOrderStore.deliveryAddress`.

#### `src/components/layouts/Navbar.tsx`

- **Role**: No address logic. Contains logo, nav items, search, language, notifications, cart, user menu. No address store or modal.

### 5.7 Services

#### `src/services/store-service.ts`

- **Address methods**: `getAddresses(params?)`, `getAddress(id)`, `createAddress(data)`, `updateAddress(id, data)`, `deleteAddress(id)` — all use `fetchLibero`/`fetchLiberoFull` with `isProtected: true`.
- **Location methods**: `getCountries()`, `getCities(countryId)`, `getDistricts(cityId)` with 24h revalidate. Used by React Query in `useAddresses.ts`.

---

## 6. Validations

- **AddressModal** (client): Required for save — address name (label), phone, country, city, street. No regex on phone in the doc’d code; optional fields (building, unit, district, notes, etc.) can be empty.
- **OrderTypeModal “Later”**: When user picks “Later”, date/time picker must be filled and confirmed; minimum date is “today” for the date input.
- **Auth**: Merge runs only when `isAuthenticated && addresses.length > 0`. API calls are protected; 401/403 are handled by the global API/auth layer.

---

## 7. Map and geocoding

- **Default center**: `DEFAULT_MAP_CENTER` from `src/lib/branches/constants.ts` (e.g. `[24.7136, 46.6753]`). Used when no lat/lng on address.
- **Zoom**: `DEFAULT_MAP_ZOOM` (e.g. 13) from same file.
- **Geocoding**: Always via `/proxy/nominatim` (search and reverse). Do not call Nominatim from the client directly (CORS and `accept-language`). Proxy is expected to add `accept-language=ar` for RTL/locale.

---

## 8. Where to find types and config

- **Address / request types**: `src/types/address.ts` (Address, CreateAddressRequest, UpdateAddressRequest, AddressFormSubmitPayload, toCreateAddressRequest, toUpdateAddressRequest, Country, City, District).
- **Delivery sync**: `src/lib/address/deliverySync.ts` (getNextDeliveryAddressAfterMutation). Shared address display: `src/lib/address/formatAddress.ts` (getAddressLabel, formatAddressForDisplay, showAddNewAddressButton). Index: `src/lib/address/index.ts`.
- **Map constants**: `src/lib/branches/constants.ts` (DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM).
- **Auth constants**: `src/lib/auth/constants.ts` (PROTECTED_ROUTES, PROTECTED_API_ENDPOINTS).
- **Query keys**: `src/hooks/useAddresses.ts` (addressKeys, AddressListParams). Prefetch: `usePrefetchAddress()`.
- **Delete confirmation**: `src/components/modals/ConfirmModal.tsx` (used by MyAddressesView for address delete).
- **Address modal UX**: Address translations include `fetchingAddress`, `locationSelected` (toast and “Location selected” card). Modal design for small screens: outer padding `p-3 sm:p-4 md:p-5`, `max-h-[88vh] sm:max-h-[90vh]`, `rounded-xl sm:rounded-2xl md:rounded-3xl`; same pattern in OrderTypeModal.

---

## 9. Quick flow summary

1. **Guest adds delivery address**: SubHeader or OrderTypeModal → OrderTypeModal → Add/Edit → AddressModal → onSave → OrderTypeModal uses `addGuestAddress` + `setDeliveryAddress` (no API). Data in `useAddressStore` + `useOrderStore`.
2. **Guest logs in or completes signup**: `useAuthFlowHandlers` runs `mergeGuestAddressAfterAuth` → POST each guest address to API → `clearAddresses()`. No periodic sync.
3. **Auth user opens My Addresses**: MyAddressesView uses `useAddresses()` → GET /addresses. Add/Edit/Delete/Set default use mutations and sync `deliveryAddress` when the changed address is the active one.
4. **Auth user changes delivery in OrderTypeModal**: Same modal uses `useAddresses()` for list; create/update mutations and then `setDeliveryAddress(result)`.
5. **Anywhere we show “delivery to”**: Read `useOrderStore.deliveryAddress` (SubHeader, OrderTypeCard, OrderTypeModal). Edits that affect that address update it via `setDeliveryAddress`.

---

## 10. Implemented refactors (current state)

The following have been implemented and are the source of truth:

- **Delivery address sync**: `getNextDeliveryAddressAfterMutation()` in `src/lib/address/deliverySync.ts` is used by MyAddressesView and OrderTypeModal after create/update/delete/set_default.
- **Shared address display**: `getAddressLabel()` and `formatAddressForDisplay()` in `src/lib/address/formatAddress.ts` are used by SubHeader, OrderTypeCard, OrderTypeModal, and AddressCard.
- **“Add New” visibility**: `showAddNewAddressButton(isAuthenticated, addressCount)` in `src/lib/address/formatAddress.ts` is used in OrderTypeModal.
- **Typed form payload**: `AddressFormSubmitPayload`, `toCreateAddressRequest()`, and `toUpdateAddressRequest()` in `src/types/address.ts`; AddressModal `onSave` and handlers use these. No `addressData: any` or `as any` on delivery address.
- **Pending city/district**: AddressModal clears `selectedCity` and `selectedDistrict` when populating an address for edit, then sets `pendingCity`/`pendingDistrict`; the two useEffects apply them when cities/districts lists load so country/city/district show correctly when updating an address.
- **Query key typing**: `addressKeys.list(params)` uses `AddressListParams` (`{ default?: boolean; label?: string }`) in `src/hooks/useAddresses.ts`.
- **Delete confirmation**: MyAddressesView uses `ConfirmModal` (variant danger) with translations `deleteTitle`, `deleteConfirm`, `confirmDelete`, `cancel`; no native `confirm()`.
- **Merge logging**: `useAddressMerge` logs only when `process.env.NODE_ENV === 'development'`.
- **Prefetch on hover**: `usePrefetchAddress()` in useAddresses; MyAddressesView passes `onMouseEnter={() => prefetchAddress(address.id)}` to AddressCard so edit modal can open with cached data.
- **Optimistic save close**: OrderTypeModal and MyAddressesView close the address modal immediately when the user clicks Save, then run the mutation in the background and show success/error toast. No change to business logic; only when the modal closes.
- **Modal design (small screens)**:
  - **Spacing**: AddressModal and OrderTypeModal use outer padding `p-3 sm:p-4 md:p-5` so the modal never touches the screen edges on mobile.
  - **Height**: Both modals use `max-h-[88vh] sm:max-h-[90vh]` so they stay within the viewport with visible top/bottom margin.
  - **Radius**: Modal containers use `rounded-xl sm:rounded-2xl md:rounded-3xl` on mobile (smaller radius). Internal elements (buttons, cards, inputs) use `rounded-lg sm:rounded-xl` where applicable.
  - **Touch**: Footer and close buttons use `min-h-[48px]` or 44px touch targets and `touch-manipulation` where appropriate.
- **AddressModal loading**: When `isFetchingAddress`, a full skeleton matching the form+map grid is shown (same layout as content) so the modal doesn’t jump in size; content area has a fixed min-height for stable height.
- **Location selection feedback**: On map click or search selection, AddressModal shows a toast “Location selected” (translation key `locationSelected`). A “Location selected” card with check icon and formatted address appears above the search field; the same address is shown in a compact card below the map. Map overlay label uses the same translation.
- **Country/City/District selects**: AddressModal uses explicit `value={selectedX === '' ? '' : selectedX}` for correct option matching, ChevronDown icon (end side, RTL-aware), `min-h-[48px]`, focus ring, and `ps-4 pe-10` for spacing. Edit flow clears city/district then applies pending when lists load.

---

## 11. Remaining risks, potential improvements, and refactor ideas

### 11.1 Remaining risks / things to watch

- **No retry UX for failed merge**: If merge fails at login/signup, addresses stay in localStorage but there is no in-app “Retry merge” action; the user would need to log out and log in again or complete another auth flow to retry.
- **Guest address cast in OrderTypeModal**: When saving as guest, the code builds `guestAddr` and casts to `Address` (`as Address`) because the form payload does not include all Address fields (e.g. `city_name`). Functionally correct but the type could be refined (e.g. a `GuestAddress` type that is a subset of Address).
- **ConfirmModal translations**: ConfirmModal receives `title`, `message`, `confirmLabel`, `cancelLabel` as props; callers must pass translated strings. Consider a variant that takes translation keys and namespace for consistency.

### 11.2 Potential enhancements

- **Retry merge**: After login/signup, if merge fails, show a toast or banner with “Retry” that calls `mergeGuestAddressAfterAuth()` again.
- **Optimistic updates**: For delete/set default in MyAddressesView, consider optimistic updates with rollback on error for snappier UI.
- **Phone validation**: Add format/validation for phone in AddressModal (e.g. length, digits) and reuse in merge payload.
- **Address limit**: If the API supports a max number of addresses, enforce it in the UI (disable “Add” or show a message when at limit).
- **Prefetch on visible**: In addition to hover, prefetch address when the card enters the viewport (e.g. IntersectionObserver) so edit opens fast even without hover.

### 11.3 Further optimizations / refactors

- **AddressSummary component**: SubHeader and OrderTypeCard still render label + formatted text manually; a small `<AddressSummary address={...} />` that uses `getAddressLabel` and `formatAddressForDisplay` could reduce JSX duplication.
- **Single source for “delivery to” copy**: The phrase “Delivery to (label)” appears in SubHeader and OrderTypeCard with the same structure; a shared snippet or component would keep copy and structure in one place.
- **StaleTime for list**: `useAddresses()` has no explicit `staleTime`; list refetches on every mount/window focus by default. If the list changes rarely, adding a short `staleTime` could reduce unnecessary refetches.

Using this doc, you or an AI agent can trace every step of the address flow, see exactly which files and stores are involved, when sync runs, and what to change or extend without breaking guest vs auth behavior or the single delivery-address source of truth.
