export interface ProductVariety {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    calories?: number;
    prepTime?: number;
    isDefault?: boolean;
}

export interface ProductAddon {
    id: string;
    name: string;
    price: number;
}

export interface ProductSauce {
    id: string;
    name: string;
    price: number;
}

export interface ProductAllergy {
    name: string;
    icon: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    images: string[];
    calories: number;
    prepTime: number;
    allergies: ProductAllergy[];
    varieties: ProductVariety[];
    addons: ProductAddon[];
    sauces: ProductSauce[];
}

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'مارجريتا وسط',
        description: 'صوص طماطم طازج، جبن موزاريلا ذائب، وأوراق ريحان عطرية',
        images: [
            'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1655673654158-9f7285b7d1ea?auto=format&fit=crop&q=80&w=800',
        ],
        calories: 450,
        prepTime: 25,
        allergies: [
            { name: 'الحليب', icon: '🥛' },
            { name: 'البيض', icon: '🥚' },
            { name: 'القمح', icon: '🌾' },
            { name: 'السمسم', icon: '🥜' },
            { name: 'فول الصويا', icon: '🫘' },
            { name: 'الخردل', icon: '🌭' },
        ],
        varieties: [
            {
                id: 'v1',
                name: 'كبير',
                price: 35,
                originalPrice: 40,
                calories: 650,
                prepTime: 30,
            },
            {
                id: 'v2',
                name: 'وسط',
                price: 25,
                originalPrice: 30,
                calories: 450,
                prepTime: 25,
                isDefault: true,
            },
            {
                id: 'v3',
                name: 'صغير',
                price: 20,
                originalPrice: 25,
                calories: 350,
                prepTime: 20,
            },
        ],
        addons: [
            { id: 'a1', name: 'جبنة', price: 5 },
            { id: 'a2', name: 'دجاج مشوي', price: 5 },
            { id: 'a3', name: 'زيتون أسود', price: 5 },
            { id: 'a4', name: 'بيبروني', price: 5 },
            { id: 'a5', name: 'بصل', price: 5 },
            { id: 'a6', name: 'فلفل اخضر', price: 5 },
            { id: 'a7', name: 'لحم', price: 5 },
            { id: 'a8', name: 'طماطم', price: 5 },
        ],
        sauces: [
            { id: 's1', name: 'صوص باربكيو', price: 5 },
            { id: 's2', name: 'صوص ايطالي', price: 5 },
            { id: 's3', name: 'مايونيز', price: 5 },
        ],
    },
];

export async function getProductById(id: string): Promise<Product | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockProducts.find((p) => p.id === id) || null;
}

export interface Order {
    id: string;
    orderNumber: string;
    branchName: string;
    createdAt: string;
    deliveryLocation: string;
    totalAmount: number;
    rating: number;
    status: 'delivered' | 'waiting';
}

export async function getOrders(): Promise<Order[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [
        {
            id: '1',
            orderNumber: '2431',
            branchName: 'النخيل',
            createdAt: '22/11/2025, 10:00 م',
            deliveryLocation: 'للمنزل',
            totalAmount: 35.0,
            rating: 4.5,
            status: 'delivered',
        },
        {
            id: '2',
            orderNumber: '2431',
            branchName: 'النخيل',
            createdAt: '22/11/2025, 10:00 م',
            deliveryLocation: 'للمنزل',
            totalAmount: 35.0,
            rating: 4.5,
            status: 'waiting',
        },
        {
            id: '3',
            orderNumber: '2431',
            branchName: 'النخيل',
            createdAt: '22/11/2025, 10:00 م',
            deliveryLocation: 'للمنزل',
            totalAmount: 35.0,
            rating: 4.5,
            status: 'waiting',
        },
        {
            id: '4',
            orderNumber: '2431',
            branchName: 'النخيل',
            createdAt: '22/11/2025, 10:00 م',
            deliveryLocation: 'للمنزل',
            totalAmount: 35.0,
            rating: 4.5,
            status: 'waiting',
        },
    ];
}
