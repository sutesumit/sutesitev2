'use client'
import React from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import fallingLeavesLottie from '../../../public/fallingLeaves'

const FallingLeaves: React.FC = () => {

  const lottieRef = React.useRef<LottieRefCurrentProps | null>(null);

  const handleMouseEnter = () => {
    if (lottieRef.current) {
      lottieRef.current.goToAndPlay(0, true);
    }
  }

  return (
    <div className='inline-block cursor-pointer' onMouseEnter={handleMouseEnter}>
      <Lottie lottieRef={lottieRef} animationData={fallingLeavesLottie} autoPlay={true} loop={false} className="inline-block h-4 w-4 ml-1" />
    </div>
  )
}

export default FallingLeaves