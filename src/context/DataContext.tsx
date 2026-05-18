import { createContext, useContext, useState, ReactNode } from 'react';
import { StokKaydi } from '../types';

interface DataContextType {
  records: StokKaydi[];
  setRecords: (records: StokKaydi[]) => void;
  fileName: string;
  setFileName: (name: string) => void;
  hasData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<StokKaydi[]>([]);
  const [fileName, setFileName] = useState<string>('');

  return (
    <DataContext.Provider
      value={{
        records,
        setRecords,
        fileName,
        setFileName,
        hasData: records.length > 0,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
