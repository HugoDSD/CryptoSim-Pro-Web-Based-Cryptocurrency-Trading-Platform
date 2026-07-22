import React from 'react';
import { Result } from 'antd';
export default function Placeholder({ title }) {
    return <Result status="info" title={title} subTitle="This page is under construction." />;
}
