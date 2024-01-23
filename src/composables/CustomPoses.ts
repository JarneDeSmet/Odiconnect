import {Finger, FingerCurl, FingerDirection} from "fingerpose/src/FingerDescription";
import GestureDescription from "fingerpose/src/GestureDescription";

export const loveYouGesture: GestureDescription = new GestureDescription('i_love_you')



//duim geen curl
loveYouGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl)
loveYouGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.9)
loveYouGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.9)

//Wijsvinger
loveYouGesture.addCurl(Finger.Index, FingerCurl.NoCurl)
loveYouGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1)
loveYouGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9)
loveYouGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.9)

//Pink
loveYouGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl)
loveYouGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1)
loveYouGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9)
loveYouGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.9)

//middelvinger en ring
for (const finger of [Finger.Middle, Finger.Ring]) {
    loveYouGesture.addCurl(finger, FingerCurl.FullCurl, 1.0)
    loveYouGesture.addCurl(finger, FingerCurl.HalfCurl, 0.9)

}