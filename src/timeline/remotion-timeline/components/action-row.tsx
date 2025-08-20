import { parseMedia } from "@remotion/media-parser";
import { PlayerRef } from "@remotion/player";
import React, { useCallback } from "react";
import { useTimelineContext } from "../context/use-timeline-context";
import { generateRandomId, getRandomItemColor } from "../context/utils";
import Button from "./button";
import { PlusIcon } from "./icons";
import { ZoomSlider } from "./zoom-slider";

export const ActionRow: React.FC<{
  playerRef: React.RefObject<PlayerRef | null>;
}> = ({ playerRef }) => {
  const { findSpaceForItem, ensureAddAndSelectItem, setSelectedItem, fps } =
    useTimelineContext();

  const addSolid = useCallback(() => {
    const durationInFrames = 20;
    const space = findSpaceForItem(
      durationInFrames,
      playerRef.current?.getCurrentFrame() ?? 0
    );

    if (!space) {
      return;
    }

    const id = generateRandomId();
    const color = getRandomItemColor();
    ensureAddAndSelectItem(space.trackIndex, {
      id,
      durationInFrames,
      from: space.startAt,
      type: "solid",
      color,
      isDragging: false,
    });
    setSelectedItem(id);
  }, [playerRef, setSelectedItem, ensureAddAndSelectItem, findSpaceForItem]);

  const addText = useCallback(() => {
    const durationInFrames = 20;
    const space = findSpaceForItem(
      durationInFrames,
      playerRef.current?.getCurrentFrame() ?? 0
    );
    if (!space) {
      throw new Error("Could not find space for text");
    }

    const id = generateRandomId();
    const color = getRandomItemColor();
    ensureAddAndSelectItem(space.trackIndex, {
      id,
      durationInFrames,
      from: space.startAt,
      type: "text",
      text: "Remotion",
      color,
      isDragging: false,
    });
    setSelectedItem(id);
  }, [playerRef, setSelectedItem, findSpaceForItem, ensureAddAndSelectItem]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const addVideo = useCallback(() => {
    videoInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const imageUrl = URL.createObjectURL(file);
      const durationInFrames = 20;
      const space = findSpaceForItem(
        durationInFrames,
        playerRef.current?.getCurrentFrame() ?? 0
      );
      if (!space) {
        throw new Error("Could not find space for image");
      }

      const id = generateRandomId();
      ensureAddAndSelectItem(space.trackIndex, {
        id,
        durationInFrames,
        from: space.startAt,
        type: "image",
        imgUrl: imageUrl,
        isDragging: false,
      });
      setSelectedItem(id);
    },
    [playerRef, setSelectedItem, findSpaceForItem, ensureAddAndSelectItem]
  );

  const handleVideoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);

      try {
        // Use our custom MediaLoader instead of parseMedia
        const { MediaLoader } = await import('../../engine/media-loader');
        const mediaLoader = MediaLoader.getInstance();
        const metadata = await mediaLoader.loadMediaMetadata(url);
        
        const durationInFrames = Math.floor(
          metadata.duration * fps
        );

        const space = findSpaceForItem(
          durationInFrames,
          playerRef.current?.getCurrentFrame() ?? 0
        );

        if (!space) {
          throw new Error("Could not find space for video/audio");
        }

        const isAudio = !metadata.hasVideo;
        const id = generateRandomId();

        if (isAudio) {
          ensureAddAndSelectItem(space.trackIndex, {
            id: generateRandomId(),
            durationInFrames,
            from: space.startAt,
            type: "audio",
            audioUrl: url,
            audioDurationInSeconds: metadata.duration,
            audioStartFromInSeconds: 0,
            isDragging: false,
          });
        } else {
          ensureAddAndSelectItem(space.trackIndex, {
            id,
            durationInFrames,
            videoDurationInSeconds: metadata.duration,
            videoStartFromInSeconds: 0,
            from: space.startAt,
            type: "video",
            videoUrl: url,
            isDragging: false,
          });
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Error getting video metadata:", error);
        window.alert(`Error getting video metadata: ${message}`);
      }
    },
    [playerRef, findSpaceForItem, fps, ensureAddAndSelectItem]
  );

  return (
    <div className="flex w-full items-center justify-between sm:h-10">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*,audio/*"
        onChange={handleVideoChange}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-1 p-3 pl-0 sm:grid-cols-4">
        <Button onClick={addSolid} className="w-full">
          <PlusIcon />
          Solid
        </Button>
        <Button onClick={addText} className="w-full">
          <PlusIcon />
          Text
        </Button>
        <Button onClick={addImage} className="w-full">
          <PlusIcon />
          Image
        </Button>
        <Button onClick={addVideo} className="w-full">
          <PlusIcon />
          Video / Audio
        </Button>
      </div>
      <ZoomSlider />
    </div>
  );
};
