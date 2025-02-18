'use client'
import React from 'react'
import Lottie from 'lottie-react'
import fallingLeavesLottie from '../../../../public/fallingLeaves'

const FallingLeaves: React.FC = () => {

  return (
    <>
      <Lottie animationData={fallingLeavesLottie} autoPlay={true} loop={false} className="inline-block h-4 w-4 ml-2" />
    </>
  )
}

export default FallingLeaves