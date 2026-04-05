'use client';

import { useRef } from 'react';
import { useGetInfo } from '@/hooks/useInfo';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';

export const CareerTimeline = () => {
  const { data: info } = useGetInfo();
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${info?.name || 'Resume'}_CV`,
  });

  const sortedCareer =
    info?.career?.slice().sort((a, b) => {
      // Sort by start date desc (assuming ISO strings or YYYY-MM)
      // A simple string comparison often works for ISO dates, but let's be safe if they use free text
      return (b.startDate || '').localeCompare(a.startDate || '');
    }) || [];

  return (
    <section className="container w-full px-4 py-12 md:px-6">
      <div className="mb-8 flex justify-end">
        <Button variant="outline" onClick={() => handlePrint && handlePrint()} className="gap-2">
          <Download className="h-4 w-4" /> Download CV
        </Button>
      </div>

      {/* Hidden Printable Version */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef} className="mx-auto max-w-[210mm] bg-white p-12 text-black">
          {/* Header */}
          <div className="mb-8 border-b pb-8">
            <h1 className="mb-2 text-4xl font-bold">{info?.name}</h1>
            <p className="mb-4 text-xl text-gray-600">{info?.role}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {info?.email && <span>{info.email}</span>}
              {info?.phone && <span>• {info.phone}</span>}
              {info?.location && <span>• {info.location}</span>}
              {info?.website && <span>• {info.website}</span>}
            </div>
            {info?.bio && <p className="mt-4 text-gray-700">{info.bio}</p>}
          </div>

          {/* Experience Section */}
          <div>
            <h2 className="mb-6 inline-block border-b-2 border-gray-800 pb-1 text-2xl font-bold tracking-wider text-gray-800 uppercase">
              Experience
            </h2>
            <div className="space-y-6">
              {sortedCareer.map((item, index) => (
                <div key={index} className="break-inside-avoid">
                  <div className="mb-1 flex items-baseline justify-between">
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <span className="text-sm font-medium text-gray-500">
                      {item.startDate ? dayjs(item.startDate).format('MMM YYYY') : ''}
                      {' - '}
                      {item.current
                        ? 'Present'
                        : item.endDate
                          ? dayjs(item.endDate).format('MMM YYYY')
                          : ''}
                    </span>
                  </div>
                  <div className="text-md mb-2 font-semibold text-gray-700">{item.company}</div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
