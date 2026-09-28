import React from 'react';
import { Transporter, Job, Language, ICD } from '../../types';
import { DEFAULT_ICDS } from '../../services/icdService';
import { LeafletLiveFleetMap } from './LeafletLiveFleetMap';

interface LiveTransportMapProps {
  transporters?: Transporter[];
  activeJob?: Job | null;
  language?: Language;
  icds?: ICD[];
  onSelectTransporter?: (transporter: Transporter) => void;
  onDirectBook?: (transporter: Transporter) => void;
}

export const LiveTransportMap: React.FC<LiveTransportMapProps> = ({
  transporters,
  activeJob,
  language = 'en',
  onSelectTransporter,
  onDirectBook,
}) => {
  return (
    <LeafletLiveFleetMap
      clientJobId={activeJob?.id}
      language={language}
      onSelectTruck={(truck) => {
        if (onSelectTransporter && transporters) {
          const match = transporters.find(t => t.id === truck.transporterId || t.name === truck.driverName);
          if (match) onSelectTransporter(match);
        }
      }}
    />
  );
};
