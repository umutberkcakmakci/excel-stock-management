import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import UploadPage from './pages/UploadPage';
import DataPage from './pages/DataPage';
import LetterPage from './pages/LetterPage';
import CompanyPage from './pages/CompanyPage';
import StockCodePage from './pages/StockCodePage';
import DetailPage from './pages/DetailPage';

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          {/* Home: upload excel */}
          <Route path="/" element={<UploadPage />} />

          {/* A-Z letter index page */}
          <Route path="/data" element={<DataPage />} />

          {/* Companies starting with a letter */}
          <Route path="/data/letter/:letter" element={<LetterPage />} />

          {/* Stock codes of a company */}
          <Route path="/data/letter/:letter/company/:companyKey" element={<CompanyPage />} />

          {/* Records for a stock code */}
          <Route path="/data/letter/:letter/company/:companyKey/stock/:stockCode" element={<StockCodePage />} />

          {/* Detail page (clicked Lot No / Fatura No / Sipariş No / Yetkili) */}
          <Route
            path="/data/letter/:letter/company/:companyKey/stock/:stockCode/detail/:detailType/:detailValue"
            element={<DetailPage />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}
