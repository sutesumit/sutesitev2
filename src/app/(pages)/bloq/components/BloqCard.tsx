'use client'
import { BloqPost } from '@/lib/bloq'
import { BloqCardList } from './BloqCard/BloqCardList'
import { BloqCardDetail } from './BloqCard/BloqCardDetail'

interface BloqCardProps {
  post: BloqPost;
  variant?: 'list' | 'detail' | 'related-post';
  className?: string;
}

const BloqCard = ({ post, variant = 'list', className }: BloqCardProps) => {
  if (variant === 'detail') {
    return <BloqCardDetail post={post} className={className} />;
  }
  
  return <BloqCardList variant={variant} post={post} className={className} />;
}

export default BloqCard
