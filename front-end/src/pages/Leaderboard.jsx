import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Button, Alert, Typography, Segmented, Space } from 'antd';
import { ReloadOutlined, TrophyOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
import { formatUSD, formatPercent, pnlColor } from '../utils/format';
const { Title } = Typography;
const SORTS = [
    {
        label: 'Total value',
        value: 'nlv',
    },
    {
        label: 'Crypto value',
        value: 'cryptovalue',
    },
    {
        label: 'Return %',
        value: 'percentage',
    },
    {
        label: 'Activity',
        value: 'activity',
    },
];
const medal = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null);
export default function Leaderboard() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('nlv');
    const load = useCallback(async (criteria) => {
        setLoading(true);
        setError('');
        try {
            setRows((await apiService.getLeaderboard(criteria)) || []);
        } catch (err) {
            setError(err.message || 'Unable to load the leaderboard.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load(sortBy);
    }, [sortBy, load]);
    const columns = [
        {
            title: 'Rank',
            dataIndex: 'classement',
            key: 'classement',
            align: 'center',
            width: 90,
            render: (r) =>
                medal(r) ? (
                    <span
                        style={{
                            fontSize: 20,
                        }}
                    >
                        {medal(r)}
                    </span>
                ) : (
                    <strong>#{r}</strong>
                ),
        },
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
            render: (name) => <strong>{name}</strong>,
        },
        {
            title: 'Total value',
            dataIndex: 'netLiquidationValue',
            key: 'netLiquidationValue',
            align: 'right',
            render: (v) => formatUSD(v),
        },
        {
            title: 'Crypto value',
            dataIndex: 'totalCryptoValue',
            key: 'totalCryptoValue',
            align: 'right',
            render: (v) => formatUSD(v),
        },
        {
            title: 'Total P&L',
            dataIndex: 'totalPAndL',
            key: 'totalPAndL',
            align: 'right',
            render: (v) => (
                <span
                    style={{
                        color: pnlColor(v),
                    }}
                >
                    {Number(v) >= 0 ? '+' : ''}
                    {formatUSD(v)}
                </span>
            ),
        },
        {
            title: 'Return',
            dataIndex: 'earningReturn',
            key: 'earningReturn',
            align: 'right',
            render: (v) => (
                <Tag color={Number(v) > 0 ? 'green' : Number(v) < 0 ? 'red' : 'default'}>
                    {formatPercent(v)}
                </Tag>
            ),
        },
        {
            title: 'Activity',
            dataIndex: 'activityVolume',
            key: 'activityVolume',
            align: 'right',
            render: (v) => `${v} order${Number(v) > 1 ? 's' : ''}`,
        },
    ];
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    gap: 12,
                }}
            >
                <Title
                    level={3}
                    style={{
                        margin: 0,
                    }}
                >
                    <TrophyOutlined /> Leaderboard
                </Title>
                <Space wrap>
                    <Segmented options={SORTS} value={sortBy} onChange={setSortBy} />
                    <Button icon={<ReloadOutlined />} onClick={() => load(sortBy)}>
                        Refresh
                    </Button>
                </Space>
            </div>

            {error && (
                <Alert
                    type="error"
                    showIcon
                    message={error}
                    style={{
                        marginBottom: 16,
                    }}
                />
            )}

            <Card>
                <Table
                    rowKey="classement"
                    loading={loading}
                    columns={columns}
                    dataSource={rows}
                    pagination={false}
                    scroll={{
                        x: 'max-content',
                    }}
                />
                <div
                    style={{
                        marginTop: 12,
                        color: 'rgba(0,0,0,0.45)',
                        fontSize: 12,
                    }}
                >
                    Top 10 investors, sorted by{' '}
                    {SORTS.find((s) => s.value === sortBy)?.label.toLowerCase()}.
                </div>
            </Card>
        </div>
    );
}
