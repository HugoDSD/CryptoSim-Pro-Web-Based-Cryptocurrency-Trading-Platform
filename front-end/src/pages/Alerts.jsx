import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Row,
    Col,
    Card,
    Table,
    Tag,
    Button,
    Alert,
    Typography,
    Space,
    Select,
    InputNumber,
    Segmented,
    Switch,
    Popconfirm,
    Badge,
    App,
} from 'antd';
import {
    ReloadOutlined,
    PlusOutlined,
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from '@ant-design/icons';
import * as signalR from '@microsoft/signalr';
import apiService from '../services/apiService';
import { formatPrice, cryptoLabel, CRYPTOS } from '../utils/format';
const { Title, Text } = Typography;
const HUB_URL = 'http://localhost:5025/notificationHub';
export default function Alerts() {
    const { message, notification } = App.useApp();
    const [alerts, setAlerts] = useState([]);
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);
    const [cryptoId, setCryptoId] = useState('bitcoin');
    const [targetPrice, setTargetPrice] = useState(null);
    const [direction, setDirection] = useState('ABOVE');
    const [creating, setCreating] = useState(false);
    const connectionRef = useRef(null);
    const loadAlerts = useCallback(async () => {
        setError('');
        try {
            setAlerts((await apiService.getPriceAlerts(false)) || []);
        } catch (err) {
            setError(err.message || 'Unable to load alerts.');
        } finally {
            setLoading(false);
        }
    }, []);
    const loadPrices = useCallback(async () => {
        try {
            setPrices((await apiService.getMarketPrices()) || []);
        } catch {}
    }, []);
    useEffect(() => {
        loadAlerts();
        loadPrices();
    }, [loadAlerts, loadPrices]);
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: () => apiService.getToken(),
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();
        connection.on('ReceiveNotification', (payload) => {
            notification.open({
                message: `Price alert — ${cryptoLabel(payload?.cryptoId)}`,
                description: payload?.message || 'One of your alerts has been triggered.',
                type: 'info',
                duration: 0,
            });
            loadAlerts();
        });
        connection.onreconnected(() => setConnected(true));
        connection.onreconnecting(() => setConnected(false));
        connection.onclose(() => setConnected(false));
        let stopped = false;
        const startPromise = connection
            .start()
            .then(() => {
                if (!stopped) setConnected(true);
            })
            .catch(() => {
                if (!stopped) setConnected(false);
            });
        connectionRef.current = connection;
        return () => {
            stopped = true;
            startPromise.finally(() => connection.stop());
        };
    }, [loadAlerts, notification]);
    const currentPrice = Number(prices.find((p) => p.id === cryptoId)?.currentPrice) || 0;
    const create = async () => {
        if (!targetPrice || targetPrice <= 0) {
            message.warning('Please enter a strictly positive target price.');
            return;
        }
        setCreating(true);
        try {
            await apiService.createPriceAlert(cryptoId, targetPrice, direction);
            message.success('Alert created.');
            setTargetPrice(null);
            await loadAlerts();
        } catch (err) {
            message.error(err.message || 'Unable to create the alert.');
        } finally {
            setCreating(false);
        }
    };
    const toggle = async (id) => {
        try {
            await apiService.togglePriceAlert(id);
            await loadAlerts();
        } catch (err) {
            message.error(err.message || 'Unable to update the alert.');
        }
    };
    const remove = async (id) => {
        try {
            await apiService.deletePriceAlert(id);
            message.success('Alert deleted.');
            await loadAlerts();
        } catch (err) {
            message.error(err.message || 'Unable to delete the alert.');
        }
    };
    const columns = [
        {
            title: 'Asset',
            dataIndex: 'cryptoId',
            render: (id) => <strong>{cryptoLabel(id)}</strong>,
        },
        {
            title: 'Condition',
            dataIndex: 'direction',
            render: (dir) => (
                <Tag color={dir === 'ABOVE' ? 'green' : 'red'}>
                    {dir === 'ABOVE' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
                    {dir === 'ABOVE' ? 'Above' : 'Below'}
                </Tag>
            ),
        },
        {
            title: 'Target price',
            dataIndex: 'targetPrice',
            align: 'right',
            render: (p) => formatPrice(p),
        },
        {
            title: 'Active',
            dataIndex: 'isActive',
            align: 'center',
            render: (active, row) => <Switch checked={active} onChange={() => toggle(row.id)} />,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, row) => (
                <Popconfirm
                    title="Delete this alert?"
                    onConfirm={() => remove(row.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
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
                    Price alerts
                </Title>
                <Space>
                    <Badge
                        status={connected ? 'success' : 'default'}
                        text={connected ? 'Live' : 'Connecting...'}
                    />
                    <Button icon={<ReloadOutlined />} onClick={loadAlerts}>
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

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={9}>
                    <Card title="New alert">
                        <Text type="secondary">Cryptocurrency</Text>
                        <Select
                            style={{
                                width: '100%',
                                marginTop: 4,
                                marginBottom: 12,
                            }}
                            value={cryptoId}
                            onChange={setCryptoId}
                            options={CRYPTOS.map((c) => ({
                                value: c.id,
                                label: `${c.name} (${c.symbol})`,
                            }))}
                            showSearch
                            optionFilterProp="label"
                        />

                        <div
                            style={{
                                marginBottom: 12,
                                color: 'rgba(0,0,0,0.65)',
                            }}
                        >
                            Current price: <strong>{formatPrice(currentPrice)}</strong>
                        </div>

                        <Text type="secondary">Trigger when the price is</Text>
                        <Segmented
                            block
                            value={direction}
                            onChange={setDirection}
                            options={[
                                {
                                    label: 'Above',
                                    value: 'ABOVE',
                                },
                                {
                                    label: 'Below',
                                    value: 'BELOW',
                                },
                            ]}
                            style={{
                                margin: '4px 0 12px',
                            }}
                        />

                        <Text type="secondary">Target price ($)</Text>
                        <InputNumber
                            style={{
                                width: '100%',
                                marginTop: 4,
                            }}
                            min={0}
                            value={targetPrice}
                            onChange={setTargetPrice}
                            placeholder="0.00"
                            stringMode
                        />

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            block
                            size="large"
                            loading={creating}
                            onClick={create}
                            style={{
                                marginTop: 16,
                            }}
                        >
                            Create alert
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} lg={15}>
                    <Card title="My alerts">
                        <Table
                            rowKey="id"
                            loading={loading}
                            columns={columns}
                            dataSource={alerts}
                            pagination={false}
                            scroll={{
                                x: 'max-content',
                            }}
                            locale={{
                                emptyText: 'No alert yet. Create one to be notified in real time.',
                            }}
                        />
                        <div
                            style={{
                                marginTop: 12,
                                color: 'rgba(0,0,0,0.45)',
                                fontSize: 12,
                            }}
                        >
                            A notification pops up instantly when one of your alerts is triggered
                            (real-time via SignalR).
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
