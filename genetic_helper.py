import numpy as np

"""
Helper Functions
"""

def getVerticalHeight(bird):
    return bird.y

def getHorizontalDistance(bird, pipe):
    return pipe.x - bird.x

def getVeritcalDistance(bird, pipe):
    centerGap = pipe.top_height_px + (512 - pipe.top_height_px - pipe.bottom_height_px) / 2
    birdCenter = bird.y + 16
    gapDistance = centerGap - birdCenter
    return gapDistance


