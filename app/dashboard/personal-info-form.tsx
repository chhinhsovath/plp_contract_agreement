import { Form, Input, Button, Modal, message, Space } from 'antd';
import { useEffect, useState } from 'react';

interface PersonalInfoFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: any;
}

export default function PersonalInfoForm({ visible, onClose, onSuccess, user }: PersonalInfoFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && visible) {
      form.setFieldsValue({
        fullName: user.full_name,
        email: user.email,
        phoneNumber: user.phone_number,
        address: user.address || '',
        dateOfBirth: user.date_of_birth || '',
        gender: user.gender || ''
      });
    }
  }, [user, visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Send updated user data to API
      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: values.fullName,
          email: values.email,
          phone_number: values.phoneNumber,
          address: values.address,
          date_of_birth: values.dateOfBirth,
          gender: values.gender
        })
      });

      if (response.ok) {
        message.success('ព័ត៌មានផ្ទាល់ខ្លួនបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        message.error('មានកំហុសកើតឡើងក្នុងពេលធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួន!');
      }
    } catch (error) {
      message.error('មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួន');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span className="font-hanuman">ព័ត៌មានផ្ទាល់ខ្លួន</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="fullName"
          label={<span className="font-hanuman">ឈ្មោះពេញ</span>}
          rules={[{ required: true, message: 'សូមបញ្ចូលឈ្មោះពេញ' }]}
        >
          <Input placeholder="ឈ្មោះពេញ" />
        </Form.Item>
        
        <Form.Item
          name="email"
          label={<span className="font-hanuman">អ៊ីមែល</span>}
          rules={[{ required: true, message: 'សូមបញ្ចូលអ៊ីមែល', type: 'email' }]}
        >
          <Input placeholder="អ៊ីមែល" />
        </Form.Item>
        
        <Form.Item
          name="phoneNumber"
          label={<span className="font-hanuman">លេខទូរស័ព្ទ</span>}
          rules={[{ required: true, message: 'សូមបញ្ចូលលេខទូរស័ព្ទ' }]}
        >
          <Input placeholder="លេខទូរស័ព្ទ" />
        </Form.Item>
        
        <Form.Item
          name="address"
          label={<span className="font-hanuman">អាសយដ្ឋាន</span>}
        >
          <Input.TextArea placeholder="អាសយដ្ឋាន" rows={3} />
        </Form.Item>
        
        <Form.Item
          name="dateOfBirth"
          label={<span className="font-hanuman">ថ្ងៃខែឆ្នាំកំណើត</span>}
        >
          <Input placeholder="ថ្ងៃខែឆ្នាំកំណើត" />
        </Form.Item>
        
        <Form.Item
          name="gender"
          label={<span className="font-hanuman">ភេទ</span>}
        >
          <Input placeholder="ភេទ" />
        </Form.Item>
        
        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={onClose}>
              បោះបង់
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              រក្សាទុក
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}