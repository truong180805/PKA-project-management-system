import React from 'react';
import { Empty, Button } from 'antd';

const InboxPage = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Empty 
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{ height: 100 }}
            description={<span>Tính năng <b>Nhắn tin (Inbox)</b> đang được phát triển</span>}
        >
            <Button type="primary">Quay lại Dashboard</Button>
        </Empty>
    </div>
);
export default InboxPage;