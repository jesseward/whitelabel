import React from "react";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import type { AlbumArt } from "../types";

interface MosaicStageProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  albums: AlbumArt[];
  columns: number;
  gap: number;
  padding: number;
  bgColor: string;
  stageSize: number;
  isHidden?: boolean;
}

const AlbumImage = ({
  album,
  x,
  y,
  size,
}: {
  album: AlbumArt;
  x: number;
  y: number;
  size: number;
}) => {
  const [image] = useImage(album.localUrl || album.url, "anonymous");

  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={size}
      height={size}
      cornerRadius={2}
    />
  );
};

export const MosaicStage: React.FC<MosaicStageProps> = ({
  stageRef,
  albums,
  columns,
  gap,
  padding,
  bgColor,
  stageSize,
  isHidden,
}) => {
  // Calculate dimensions
  const rows = Math.ceil(albums.length / columns);
  const containerWidth = stageSize;
  const availableWidth = containerWidth - padding * 2 - gap * (columns - 1);
  const cellSize = availableWidth / columns;
  const containerHeight = rows * cellSize + gap * (rows - 1) + padding * 2;

  return (
    <Stage
      width={containerWidth}
      height={containerHeight}
      ref={stageRef}
      className={`rounded-lg overflow-hidden shadow-inner ${isHidden ? "hidden" : "block"}`}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={containerWidth}
          height={containerHeight}
          fill={bgColor}
        />
        {albums.map((album, index) => {
          const col = index % columns;
          const row = Math.floor(index / columns);
          const x = padding + col * (cellSize + gap);
          const y = padding + row * (cellSize + gap);

          return (
            <AlbumImage
              key={album.id}
              album={album}
              x={x}
              y={y}
              size={cellSize}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};
