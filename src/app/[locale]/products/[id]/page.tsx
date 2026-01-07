import { getProductById } from '@/data/mock';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/pages/products/product-details';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) return {};

    return {
        title: `${product.name} | Fasto`,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.images.map((img) => ({ url: img })),
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description,
            images: [product.images[0]],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="py-8">
            <ProductDetails product={product} />
        </div>
    );
}
