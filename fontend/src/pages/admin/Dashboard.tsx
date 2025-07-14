import { Card, Row, Col, Statistic, Progress, Table, Divider } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  StarFilled,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Pie, Line } from '@ant-design/charts';

const { Meta } = Card;

const AdminDashboard = () => {
  // Dữ liệu biểu đồ đường
  const lineData = [
    { month: 'Feb', value: 1200 },
    { month: 'Mar', value: 1800 },
    { month: 'Apr', value: 1500 },
    { month: 'May', value: 2100 },
    { month: 'Jun', value: 1900 },
    { month: 'Jul', value: 2300 },
    { month: 'Aug', value: 2500 },
    { month: 'Sept', value: 2200 },
    { month: 'Oct', value: 2400 },
    { month: 'Nov', value: 2000 },
  ];

  const lineConfig = {
    data: lineData,
    xField: 'month',
    yField: 'value',
    point: {
      size: 5,
      shape: 'diamond',
    },
    tooltip: {
      formatter: (data : any) => {
        return { name: 'Sales', value: '$' + data.value };
      },
    },
  };

  // Dữ liệu biểu đồ tròn
  const pieData = [
    { type: 'Appliances', value: 15 },
    { type: 'Electronics', value: 20 },
    { type: 'Clothing', value: 19 },
    { type: 'Shoes', value: 25 },
    { type: 'Food', value: 10 },
    { type: 'Cosmetic', value: 11 },
  ];

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <div className="ecommerce-dashboard">
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16 }}>
        <span>Home / </span>
        <span style={{ fontWeight: 'bold' }}>Dashboards / </span>
        <span style={{ color: '#1890ff' }}>Ecommerce</span>
      </div>

      {/* Thống kê chính */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Visitors"
              value={20149}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span style={{ fontSize: 14, color: '#3f8600' }}>
                  <ArrowUpOutlined /> 6%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Customers"
              value={5834}
              prefix="$"
              valueStyle={{ color: '#cf1322' }}
              suffix={
                <span style={{ fontSize: 14, color: '#cf1322' }}>
                  <ArrowDownOutlined /> -12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Orders"
              value={3270}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span style={{ fontSize: 14, color: '#3f8600' }}>
                  <ArrowUpOutlined /> 10%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sales"
              value={1324000}
              prefix="$"
              precision={1}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span style={{ fontSize: 14, color: '#3f8600' }}>
                  <ArrowUpOutlined /> 2%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Hàng thứ 2 - Đánh giá và biểu đồ */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="Customer Reviews">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 24, marginRight: 8 }}>
                <StarFilled style={{ color: '#faad14' }} />
                <StarFilled style={{ color: '#faad14' }} />
                <StarFilled style={{ color: '#faad14' }} />
                <StarFilled style={{ color: '#faad14' }} />
                <StarFilled style={{ color: '#faad14' }} />
              </span>
              <span style={{ fontSize: 18 }}>4.6/5</span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ marginRight: 16 }}>Excellent</span>
              <Progress percent={35} strokeColor="#52c41a" showInfo={false} />
              <span style={{ float: 'right' }}>35%</span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ marginRight: 16 }}>Good</span>
              <Progress percent={25} strokeColor="#a0d911" showInfo={false} />
              <span style={{ float: 'right' }}>25%</span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ marginRight: 16 }}>Average</span>
              <Progress percent={30} strokeColor="#faad14" showInfo={false} />
              <span style={{ float: 'right' }}>30%</span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ marginRight: 16 }}>Poor</span>
              <Progress percent={10} strokeColor="#f5222d" showInfo={false} />
              <span style={{ float: 'right' }}>10%</span>
            </div>

            <a href="#reviews" style={{ float: 'right' }}>
              See all customer reviews →
            </a>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Overall Sales">
            <h2 style={{ fontSize: 24, marginBottom: 0 }}>$24,486</h2>
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}>Online Store</span>
              <span>Facebook</span>
            </div>
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>

      {/* Hàng thứ 3 - Phân loại và trạng thái đơn hàng */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="Categories">
            <Pie {...pieConfig} />
            <div style={{ marginTop: 16 }}>
              <h3>18,935 sales</h3>
              {pieData.map((item) => (
                <div key={item.type} style={{ marginBottom: 8 }}>
                  <span style={{ marginRight: 16 }}>{item.type}</span>
                  <span>{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Orders By Status">
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <div>Success</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
                <div>Pending</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <CloseCircleOutlined style={{ fontSize: 32, color: '#f5222d' }} />
                <div>Failed</div>
              </div>
            </div>

            <Divider />

            <h3>Conversion Rate</h3>
            <h1 style={{ fontSize: 32, margin: '16px 0' }}>8.48%</h1>

            <div style={{ marginBottom: 16 }}>
              <h4>Added to cart</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>$27,483.70</span>
                <span>16.6%</span>
                <span>5 visits</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4>Reached to Checkout</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>$145,483.70</span>
                <span>46.6%</span>
                <span>23 visits</span>
              </div>
            </div>

            <Divider />

            <h3>Customer Rate</h3>
            <div style={{ display: 'flex', textAlign: 'center', marginTop: 16 }}>
              <div style={{ flex: 1, borderRight: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 24 }}>30%</div>
                <div>First time buying</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24 }}>70%</div>
                <div>Returning</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;