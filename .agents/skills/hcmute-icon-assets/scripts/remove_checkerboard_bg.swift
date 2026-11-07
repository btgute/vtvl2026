import Foundation
import AppKit

func isBackground(r: UInt8, g: UInt8, b: UInt8, a: UInt8) -> Bool {
    if a == 0 { return true }
    let minVal = min(r, min(g, b))
    let maxVal = max(r, max(g, b))
    let bright = minVal >= 218
    let nearlyNeutral = (maxVal - minVal) <= 24
    return bright && nearlyNeutral
}

guard CommandLine.arguments.count >= 3 else {
    print("Usage: swift remove_checkerboard_bg.swift <input> <output>")
    exit(1)
}

let inputPath = CommandLine.arguments[1]
let outputPath = CommandLine.arguments[2]

guard let image = NSImage(contentsOfFile: inputPath),
      let tiffData = image.tiffRepresentation,
      let rep = NSBitmapImageRep(data: tiffData) else {
    print("Failed to load image at \(inputPath)")
    exit(1)
}

guard let rgbaRep = rep.converting(to: .sRGB, renderingIntent: .default) else {
    print("Failed to convert image to sRGB")
    exit(1)
}

let width = rgbaRep.pixelsWide
let height = rgbaRep.pixelsHigh
guard let rawPtr = rgbaRep.bitmapData else {
    print("No bitmap data")
    exit(1)
}

let bytesPerPixel = rgbaRep.bitsPerPixel / 8
let bytesPerRow = rgbaRep.bytesPerRow

func getPixel(_ x: Int, _ y: Int) -> (r: UInt8, g: UInt8, b: UInt8, a: UInt8) {
    let offset = y * bytesPerRow + x * bytesPerPixel
    return (rawPtr[offset], rawPtr[offset + 1], rawPtr[offset + 2], rawPtr[offset + 3])
}

func setAlphaZero(_ x: Int, _ y: Int) {
    let offset = y * bytesPerRow + x * bytesPerPixel
    rawPtr[offset] = 255
    rawPtr[offset + 1] = 255
    rawPtr[offset + 2] = 255
    rawPtr[offset + 3] = 0
}

var seen = Array(repeating: false, count: width * height)
var queue: [(Int, Int)] = []

// Add boundary pixels
for x in 0..<width {
    queue.append((x, 0))
    queue.append((x, height - 1))
}
for y in 0..<height {
    queue.append((0, y))
    queue.append((width - 1, y))
}

var head = 0
while head < queue.count {
    let (x, y) = queue[head]
    head += 1
    let idx = y * width + x
    if seen[idx] { continue }
    seen[idx] = true
    
    let p = getPixel(x, y)
    if !isBackground(r: p.r, g: p.g, b: p.b, a: p.a) {
        continue
    }
    setAlphaZero(x, y)
    
    let neighbors = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    for (nx, ny) in neighbors {
        if nx >= 0 && nx < width && ny >= 0 && ny < height {
            let nidx = ny * width + nx
            if !seen[nidx] {
                queue.append((nx, ny))
            }
        }
    }
}

// Check for enclosed checkerboard components
for startY in 0..<height {
    for startX in 0..<width {
        let sidx = startY * width + startX
        if seen[sidx] { continue }
        let sp = getPixel(startX, startY)
        if !isBackground(r: sp.r, g: sp.g, b: sp.b, a: sp.a) { continue }
        
        var comp: [(Int, Int)] = []
        var cQueue = [(startX, startY)]
        seen[sidx] = true
        var cHead = 0
        var grayCount = 0
        var whiteCount = 0
        
        while cHead < cQueue.count {
            let (cx, cy) = cQueue[cHead]
            cHead += 1
            comp.append((cx, cy))
            
            let cp = getPixel(cx, cy)
            let tone = (Int(cp.r) + Int(cp.g) + Int(cp.b)) / 3
            if tone >= 238 && tone < 250 {
                grayCount += 1
            } else if tone >= 250 {
                whiteCount += 1
            }
            
            let neighbors = [(cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)]
            for (nx, ny) in neighbors {
                if nx >= 0 && nx < width && ny >= 0 && ny < height {
                    let nidx = ny * width + nx
                    if !seen[nidx] {
                        let np = getPixel(nx, ny)
                        if isBackground(r: np.r, g: np.g, b: np.b, a: np.a) {
                            seen[nidx] = true
                            cQueue.append((nx, ny))
                        }
                    }
                }
            }
        }
        
        let size = comp.count
        let checkerTones = grayCount + whiteCount
        if size >= 64 &&
           Double(grayCount) / Double(size) >= 0.30 &&
           Double(whiteCount) / Double(size) >= 0.30 &&
           Double(checkerTones) / Double(size) >= 0.85 {
            for (cx, cy) in comp {
                setAlphaZero(cx, cy)
            }
        }
    }
}

let outUrl = URL(fileURLWithPath: outputPath)
try? FileManager.default.createDirectory(at: outUrl.deletingLastPathComponent(), withIntermediateDirectories: true)

if let pngData = rgbaRep.representation(using: .png, properties: [:]) {
    try pngData.write(to: outUrl)
    print("Saved transparent PNG to \(outputPath)")
} else {
    print("Failed to encode PNG")
    exit(1)
}
