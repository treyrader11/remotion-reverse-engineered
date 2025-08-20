
import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerRef } from '@remotion/player';
import { useProjects } from '../hooks/use-projects';
import { AppLayout, PreviewContainer } from '../timeline/layout';
import { ActionRow } from '../timeline/remotion-timeline/components/action-row';
import {
  Timeline,
  TimelineContainer,
} from '../timeline/remotion-timeline/components/timeline';
import {
  TimelineProvider,
  type TimelineInitialState,
} from '../timeline/remotion-timeline/context/provider';
import { TimelineSizeProvider } from '../timeline/remotion-timeline/context/timeline-size-provider';
import { TimelineZoomProvider } from '../timeline/remotion-timeline/context/timeline-zoom-provider';
import { useElementSize } from '../timeline/remotion-timeline/hooks/use-element-size';
import { timelineContainerRef } from '../timeline/remotion-timeline/utils/restore-scroll-after-zoom';
import { VideoPreview } from '../timeline/video-preview';

const initialState: TimelineInitialState = {
  fps: 30,
  tracks: [
    {
      id: 'track-1',
      name: 'Track 1',
      items: []
    }
  ]
};

export const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const playerRef = useRef<PlayerRef>(null);
  const { size } = useElementSize(timelineContainerRef);

  const project = projectId ? getProject(projectId) : null;

  useEffect(() => {
    if (projectId && !project) {
      // Project not found, redirect to projects page
      navigate('/');
    }
  }, [projectId, project, navigate]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 mb-2">Project not found</div>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
              title="Back to projects"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-gray-400">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Export Video
            </button>
          </div>
        </div>
      </div>

      <AppLayout>
        <PreviewContainer>
          <TimelineProvider initialState={initialState}>
            <TimelineZoomProvider>
              <TimelineSizeProvider size={size}>
                <VideoPreview loop={false} playerRef={playerRef} />
                <ActionRow playerRef={playerRef} />
                <TimelineContainer>
                  <Timeline playerRef={playerRef} />
                </TimelineContainer>
              </TimelineSizeProvider>
            </TimelineZoomProvider>
          </TimelineProvider>
        </PreviewContainer>
      </AppLayout>
    </div>
  );
};
