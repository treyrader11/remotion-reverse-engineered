import { PlayerRef } from "@remotion/player";

import React, { memo, MouseEventHandler, useCallback, useMemo } from "react";
import Button from "./button";
import { DropHandler } from "./drop-handler";
import { PlusIcon } from "./icons";
import { Playhead } from "./playhead";

import { scrollbarStyle, TIMELINE_HEIGHT, TRACK_HEIGHT } from "../constants";
import { useTimelineContext } from "../context/use-timeline-context";
import { useTimelineSize } from "../context/use-timeline-size";
import { generateRandomId } from "../context/utils";
import { useTicks } from "../hooks/use-ticks";
import { useTimelineSeek } from "../hooks/use-timeline-seek";
import {
  timelineContainerRef,
  timelineRightSide,
  timelineScrollableContainerRef,
  timelineScrollContainerRef,
} from "../utils/restore-scroll-after-zoom";
import { BackspaceToDelete } from "./keyboard-shortcuts/backspace-to-delete";
import { SpaceToPlayPause } from "./keyboard-shortcuts/space-to-play-pause";
import { TickHeaders, TickLines, TICKS_HEIGHT, TicksBackground } from "./ticks";
import { TrackContent, TrackHeader } from "./track";

const style: React.CSSProperties = {
  height: TIMELINE_HEIGHT + TICKS_HEIGHT,
};

const containerStyles: React.CSSProperties = {
  ...scrollbarStyle,
  height: TIMELINE_HEIGHT + TICKS_HEIGHT,
};

export const TimelineContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      ref={timelineContainerRef}
      className="border-timeline-border w-full shrink-0 overflow-hidden rounded-md border shadow-lg sm:mb-4"
    >
      {children}
    </div>
  );
};

const SidePanel = memo(() => {
  const { tracks, addTrack, deleteTrack } = useTimelineContext();

  const handleAddTrack = () => {
    addTrack({
      id: generateRandomId(),
      name: `Track ${tracks.length + 1}`,
      items: [],
    });
  };

  return (
    <div className="bg-timeline-bg sticky left-0 z-20 flex h-full w-1/4 flex-col sm:w-2/12">
      <div
        style={{
          height: TICKS_HEIGHT,
        }}
        className="border-timeline-border relative top-0 flex w-full shrink-0 items-center justify-end border-r-[1px] pr-2 font-bold text-white tabular-nums"
      >
        <Button onClick={handleAddTrack}>
          <PlusIcon />
        </Button>
      </div>
      <div
        id="track-headers"
        className="border-timeline-border sticky left-0 flex w-full shrink-0 flex-col border-r-[1px]"
        style={{
          minHeight: TIMELINE_HEIGHT,
          height: tracks.length * TRACK_HEIGHT,
        }}
      >
        {tracks.map((track) => (
          <div
            className="border-timeline-side-panel-separator flex w-full border-b-[1px]"
            style={{
              height: TRACK_HEIGHT,
            }}
            key={track.id}
          >
            <TrackHeader
              handleDeleteTrack={() => {
                deleteTrack(track.id);
              }}
              name={track.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

const TimelineScrollableContainer = ({
  timelineScrollableContainerRef,
  children,
}: {
  timelineScrollableContainerRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}) => {
  const { timelineWidth } = useTimelineSize();

  return (
    <div
      ref={timelineScrollableContainerRef}
      style={{
        width: timelineWidth,
        // calc minus the ticks height
        height: TIMELINE_HEIGHT - TICKS_HEIGHT,
      }}
    >
      {children}
    </div>
  );
};

export const Timeline = ({
  playerRef,
}: {
  playerRef: React.RefObject<PlayerRef | null>;
}) => {
  const {
    timelineRef,
    tracks,
    fps,
    durationInFrames: totalDurationInFrames,
  } = useTimelineContext();

  const visibleFrames = useMemo(
    () => Math.max(4 * fps, Math.round(totalDurationInFrames * 1.25)),
    [fps, totalDurationInFrames]
  );

  const { setSelectedItem } = useTimelineContext();

  const { startDragging, stopDragging } = useTimelineSeek({
    containerRef: timelineScrollableContainerRef,
    playerRef,
    totalDurationInFrames: visibleFrames,
  });

  const onPointerDownEmptySpace: MouseEventHandler = useCallback(
    (e) => {
      if (e.target === timelineScrollableContainerRef.current) {
        setSelectedItem(null);
        return;
      }
    },
    [setSelectedItem]
  );

  const { tickMarks } = useTicks({
    visibleFrames,
  });

  return (
    <>
      <div
        ref={timelineRef}
        className={"bg-timeline-bg relative h-full w-full"}
        style={style}
      >
        <DropHandler playerRef={playerRef}>
          <div
            id="tracksContainer"
            className="flex h-full w-full overflow-x-scroll overflow-y-scroll"
            style={containerStyles}
            ref={timelineScrollContainerRef}
            onPointerDown={onPointerDownEmptySpace}
          >
            <SidePanel />
            <TicksBackground />
            <div
              style={{
                minHeight: TIMELINE_HEIGHT + TICKS_HEIGHT,
                height: tracks.length * TRACK_HEIGHT + TICKS_HEIGHT,
              }}
              ref={timelineRightSide}
              className="relative h-full w-3/4 sm:w-10/12"
            >
              <div
                style={{
                  height: TICKS_HEIGHT,
                }}
                className="sticky top-0 z-10 flex w-full"
              >
                <TickHeaders
                  tickMarks={tickMarks}
                  onPointerDown={startDragging}
                  onPointerUp={stopDragging}
                />
              </div>
              <TickLines tickMarks={tickMarks} />
              <TimelineScrollableContainer
                timelineScrollableContainerRef={timelineScrollableContainerRef}
              >
                {tracks.map((track, i) => (
                  <TrackContent
                    key={track.id}
                    track={track}
                    trackIndex={i}
                    visibleFrames={visibleFrames}
                  />
                ))}
              </TimelineScrollableContainer>
              <Playhead visibleFrames={visibleFrames} playerRef={playerRef} />
            </div>
          </div>
        </DropHandler>
      </div>
      <SpaceToPlayPause playerRef={playerRef} />
      <BackspaceToDelete />
    </>
  );
};
