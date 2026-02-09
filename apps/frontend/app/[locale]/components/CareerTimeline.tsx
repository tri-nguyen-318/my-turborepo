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

  const sortedCareer = info?.career?.slice().sort((a, b) => {
      // Sort by start date desc (assuming ISO strings or YYYY-MM)
      // A simple string comparison often works for ISO dates, but let's be safe if they use free text
      return (b.startDate || '').localeCompare(a.startDate || '');
  }) || [];

  return (
    <section className="w-full py-12 container px-4 md:px-6">
      <div className="flex justify-end mb-8">
        <Button variant="outline" onClick={() => handlePrint && handlePrint()} className="gap-2">
          <Download className="h-4 w-4" /> Download CV
        </Button>
      </div>


      {/* Hidden Printable Version */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef} className="p-12 max-w-[210mm] mx-auto bg-white text-black">
            {/* Header */}
            <div className="mb-8 border-b pb-8">
                <h1 className="text-4xl font-bold mb-2">{info?.name}</h1>
                <p className="text-xl text-gray-600 mb-4">{info?.role}</p>
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
                <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider text-gray-800 border-b-2 border-gray-800 inline-block pb-1">Experience</h2>
                <div className="space-y-6">
                    {sortedCareer.map((item, index) => (
                        <div key={index} className="break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-lg font-bold">{item.title}</h3>
                                <span className="text-sm text-gray-500 font-medium">
                                    {item.startDate ? dayjs(item.startDate).format('MMM YYYY') : ''} 
                                    {' - '} 
                                    {item.current ? 'Present' : (item.endDate ? dayjs(item.endDate).format('MMM YYYY') : '')}
                                </span>
                            </div>
                            <div className="text-md font-semibold text-gray-700 mb-2">{item.company}</div>
                            <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
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
