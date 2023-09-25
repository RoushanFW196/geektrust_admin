import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Space,
  Button,
  Popconfirm,
  Form,
  Input,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import axios from "axios";

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const AdminTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingid, setEditingid] = useState("");
  const [form] = Form.useForm();
  const isEditing = (record) => record.id === editingid;
  const userRef = useRef();
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      editable: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      editable: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      editable: true,
    },
    {
      title: "Action",
      key: "action",

      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <div className="editable-row-operations">
              <span className="iconWrapper" onClick={() => save(record.id)}>
                <SaveOutlined />
              </span>
              <span className="iconWrapper cancel">
                <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                  <CloseOutlined />
                </Popconfirm>
              </span>
            </div>
          </span>
        ) : (
          <div className="editable-row-operations">
            <span
              className="iconWrapper"
              disabled={editingid !== ""}
              onClick={() => edit(record)}
            >
              <EditOutlined />
            </span>
            <span className="iconWrapper cancel">
              <Popconfirm
                title="Are you sure, you want to delete it?"
                onConfirm={() => deletesingleRecord(record.id)}
              >
                <DeleteOutlined />
              </Popconfirm>
            </span>
          </div>
        );
      },
    },
  ];

  const getusers = async () => {
    const getdata = await axios.get(
      `http://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`
    );
    // const getdata= await axios.get(`${USER_URl}`) in this urls are getting concatenated. find out why?
    const getallusers = getdata["data"];
    userRef.current = getallusers;
    setUsers(getallusers);
  };

  useEffect(() => {
    getusers();
  }, []);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const edit = (record) => {
    form.setFieldsValue({
      name: "",
      email: "",
      role: "",
      ...record,
    });
    setEditingid(record.id);
  };
  const cancel = () => {
    setEditingid("");
  };
  const save = async (id) => {
    try {
      const row = await form.validateFields();
      const newData = [...users];
      const index = newData.findIndex((item) => id === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setUsers(newData);
        setEditingid("");
      } else {
        newData.push(row);
        setUsers(newData);
        setEditingid("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const deletesingleRecord = (id) => {
    const filteredusers = users.filter((user) => user.id != id);
    setUsers(filteredusers);
    return filteredusers;
  };

  const deleteMUltipleRecord = () => {
    let allusers = Object.assign([], users);
    selectedRowKeys.map((el, index) => {
      allusers = allusers.filter((user) => user.id != el);
    });
    setUsers(allusers);
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleSearch = (e) => {
    let searchtext = e.target.value;
    if (searchtext.length > 1) {
      const filterSearchtext = users.filter(
        (user) =>
          user.name.includes(searchtext) ||
          user.email.includes(searchtext) ||
          user.role.includes(searchtext)
      );
      setUsers(filterSearchtext);
    } else {
      setUsers(userRef.current);
    }
  };

  return (
    <div className="body-wrapper">
      <article className="article">
        <div className="box box-default">
          <div className="box-body">
            <div>
              <input
                type="text"
                placeholder="Search By Name,Email or Role"
                onChange={handleSearch}
                className="search-text"
              />
            </div>
            <div>
              <Form form={form} component={false}>
                <Table
                  rowKey="id"
                  className="inlineTable resizeableTable"
                  bordered
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                  scroll={{ x: "max-content" }}
                  columns={mergedColumns}
                  dataSource={users}
                  loading={loading}
                  rowSelection={rowSelection}
                  pagination={{
                    onChange: cancel,
                  }}
                  rowClassName={(r, i) =>
                    i % 2 === 0
                      ? "table-striped-listing"
                      : "dull-color table-striped-listing"
                  }
                />
              </Form>
            </div>
            <Button
              type="primary"
              danger
              loading={loading}
              onClick={deleteMUltipleRecord}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default AdminTable;
