'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { getData, postData } from '@/lib/api';
import type { Video } from '@/types/api';

type VideoProgress = {
  currentPosition: number;
  watchedSeconds: number;
  completionPercentage: number;
  isCompleted: boolean;
};

export function VideoPlayer({ video }: { video: Video }) {
  const [position, setPosition] = useState(0);
  const sessionId = useRef(crypto.randomUUID());
  const progress = useQuery({
    queryKey: ['video-progress', video.id],
    queryFn: () => getData<VideoProgress | null>(`/video-progress/${video.id}`),
    retry: false,
  });
  const heartbeat = useMutation({
    mutationFn: (nextPosition: number) =>
      postData('/video-progress/heartbeat', {
        videoId: video.id,
        currentPosition: nextPosition,
        watchedSeconds: 15,
        completionPercentage: Math.min(100, (nextPosition / video.duration) * 100),
        sessionId: sessionId.current,
      }),
  });

  useEffect(() => {
    if (progress.data?.currentPosition) {
      setPosition(Math.min(video.duration, progress.data.currentPosition));
    }
  }, [progress.data?.currentPosition, video.duration]);

  useEffect(() => {
    if (video.duration <= 0) return;

    const timer = setInterval(() => {
      setPosition((value) => {
        const nextPosition = Math.min(video.duration, value + 15);
        heartbeat.mutate(nextPosition);
        return nextPosition;
      });
    }, 15_000);
    return () => clearInterval(timer);
  }, [heartbeat, video.duration]);

  return (
    <div className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-lg border bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="text-sm text-muted-foreground">
        Saved position: {Math.floor(position)}s of {video.duration}s
      </div>
    </div>
  );
}
