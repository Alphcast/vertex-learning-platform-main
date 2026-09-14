import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId: projectId || 'vertex-preview', dataset: dataset || 'production' })

type ImageUrlBuilderResult = ReturnType<typeof builder.image>;

function createUrlStub(url: string): ImageUrlBuilderResult {
  const stub: unknown = {
    width: () => stub,
    height: () => stub,
    fit: () => stub,
    auto: () => stub,
    quality: () => stub,
    url: () => url,
  };
  return stub as ImageUrlBuilderResult;
}

export const urlFor = (source: SanityImageSource): ImageUrlBuilderResult => {
  if (source && typeof source === 'object') {
    const src = source as Record<string, unknown>;
    const asset = src.asset as Record<string, unknown> | undefined;
    if (asset?.url && typeof asset.url === 'string') {
      return createUrlStub(asset.url);
    }
    if (src._sanityAsset && typeof src._sanityAsset === 'string') {
      const u = src._sanityAsset.replace(/^image@/, '');
      return createUrlStub(u);
    }
  }

  try {
    return builder.image(source);
  } catch {
    return createUrlStub('');
  }
}
