import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntApp } from 'antd';
import enUS from 'antd/locale/en_US';
import App from './App.jsx';
const theme = {
    token: {
        colorPrimary: '#13c2a2',
        borderRadius: 8,
    },
};
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConfigProvider theme={theme} locale={enUS}>
            <AntApp>
                <App />
            </AntApp>
        </ConfigProvider>
    </React.StrictMode>,
);
