'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { VideoPlayer } from '@/components/video/video-player';
import { getData } from '@/lib/api';
import type { Video } from '@/types/api';

export default function StudentVideoPage() {
  const params = useParams<{ id: string }>();
  const video = useQuery({ queryKey: ['video', params.id], queryFn: () => getData<Video>(`/videos/${params.id}`) });

  return (
    <>
      <PageHeader title={video.data?.title ?? 'Video'} description={video.data?.lesson?.title} />
      <Card>
        <CardContent>{video.data ? <VideoPlayer video={video.data} /> : <p>Loading...</p>}</CardContent>
      </Card>
    </>
  );
}
