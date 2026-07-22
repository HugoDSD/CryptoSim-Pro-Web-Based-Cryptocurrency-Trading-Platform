import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Row,
    Col,
    Card,
    Select,
    Segmented,
    InputNumber,
    Button,
    Statistic,
    Divider,
    Descriptions,
    Alert,
    Spin,
    Typography,
    App,
} from 'antd';
import { useSearchParams } from 'react-router-dom';
import apiService from '../services/apiService';
import { formatUSD, formatPrice, formatQuantity, CRYPTOS, cryptoLabel } from '../utils/format';
const { Title, Text } = Typography;
const FEE_RATE = 0.005;
export default function Trading() {
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const [prices, setPrices] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cryptoId, setCryptoId] = useState(searchParams.get('crypto') || 'bitcoin');
    const [side, setSide] = useState('BUY');
    const [quantity, setQuantity] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const load = useCallback(async () => {
        setError('');
        try {
            const [p, d] = await Promise.all([
                apiService.getMarketPrices(),
                apiService.getDashboard(),
            ]);
            setPrices(p || []);
            setDashboard(d);
        } catch (err) {
            setError(err.message || 'Unable to load trading data.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const currentPrice = useMemo(
        () => Number(prices.find((p) => p.id === cryptoId)?.currentPrice) || 0,
        [prices, cryptoId],
    );
    const ownedQty = useMemo(
        () => Number(dashboard?.portfolios?.find((p) => p.cryptoId === cryptoId)?.quantity) || 0,
        [dashboard, cryptoId],
    );
    const cash = Number(dashboard?.cashBalance) || 0;
    const gross = currentPrice * (quantity || 0);
    const fee = gross * FEE_RATE;
    const totalCost = gross + fee;
    const netProceeds = gross - fee;
    const submit = async () => {
        if (!quantity || quantity <= 0) {
            message.warning('Please enter a strictly positive quantity.');
            return;
        }
        if (side === 'BUY' && totalCost > cash) {
            message.error('Insufficient cash for this purchase (fees included).');
            return;
        }
        if (side === 'SELL' && quantity > ownedQty) {
            message.error("You don't hold enough of this crypto to sell.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await apiService.executeTrade(cryptoId, side, quantity);
            message.success(res?.message || 'Order executed.');
            setQuantity(0);
            await load();
        } catch (err) {
            message.error(err.message || 'The order was rejected.');
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    paddingTop: 120,
                }}
            >
                <Spin size="large" />
            </div>
        );
    }
    return (
        <div>
            <Title
                level={3}
                style={{
                    marginTop: 0,
                }}
            >
                Trading
            </Title>
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
                <Col xs={24} lg={12}>
                    <Card title="Place an order">
                        <Text type="secondary">Cryptocurrency</Text>
                        <Select
                            style={{
                                width: '100%',
                                marginTop: 4,
                                marginBottom: 16,
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

                        <Segmented
                            block
                            value={side}
                            onChange={setSide}
                            options={[
                                {
                                    label: 'Buy',
                                    value: 'BUY',
                                },
                                {
                                    label: 'Sell',
                                    value: 'SELL',
                                },
                            ]}
                            style={{
                                marginBottom: 16,
                            }}
                        />

                        <Text type="secondary">Quantity</Text>
                        <InputNumber
                            style={{
                                width: '100%',
                                marginTop: 4,
                            }}
                            min={0}
                            step={0.01}
                            value={quantity}
                            onChange={(v) => setQuantity(v || 0)}
                            placeholder="0.00"
                            stringMode
                        />

                        <div
                            style={{
                                marginTop: 8,
                            }}
                        >
                            {side === 'BUY' && currentPrice > 0 && (
                                <Button
                                    size="small"
                                    onClick={() =>
                                        setQuantity(
                                            Number(
                                                (cash / (currentPrice * (1 + FEE_RATE))).toFixed(8),
                                            ),
                                        )
                                    }
                                >
                                    Max ({formatUSD(cash)} available)
                                </Button>
                            )}
                            {side === 'SELL' && ownedQty > 0 && (
                                <Button size="small" onClick={() => setQuantity(ownedQty)}>
                                    Sell all ({formatQuantity(ownedQty)})
                                </Button>
                            )}
                        </div>

                        <Divider />

                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Current price">
                                {formatPrice(currentPrice)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Gross amount">
                                {formatUSD(gross)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Fee (0.5%)">
                                {formatUSD(fee)}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={side === 'BUY' ? 'Total debited' : 'Total credited'}
                            >
                                <strong>
                                    {formatUSD(side === 'BUY' ? totalCost : netProceeds)}
                                </strong>
                            </Descriptions.Item>
                        </Descriptions>

                        <Button
                            type="primary"
                            danger={side === 'SELL'}
                            block
                            size="large"
                            loading={submitting}
                            onClick={submit}
                            style={{
                                marginTop: 16,
                            }}
                        >
                            {side === 'BUY' ? 'Buy' : 'Sell'} {cryptoLabel(cryptoId)}
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title="My account"
                        style={{
                            marginBottom: 16,
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Available cash"
                                    value={cash}
                                    precision={2}
                                    prefix="$"
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title={`${cryptoLabel(cryptoId)} position`}
                                    value={ownedQty}
                                    precision={ownedQty < 1 ? 6 : 4}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Trading rules">
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                color: 'rgba(0,0,0,0.65)',
                            }}
                        >
                            <li>
                                Transaction fee: <strong>0.5%</strong>
                            </li>
                            <li>
                                Max exposure per asset: <strong>20%</strong> of the portfolio
                            </li>
                            <li>
                                Max global exposure: <strong>80%</strong> (at least 20% cash)
                            </li>
                        </ul>
                        <div
                            style={{
                                marginTop: 8,
                                fontSize: 12,
                                color: 'rgba(0,0,0,0.45)',
                            }}
                        >
                            An order that exceeds these limits will be rejected by the server.
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
