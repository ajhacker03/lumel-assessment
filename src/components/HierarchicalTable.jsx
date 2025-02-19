import { useState } from "react";

const initialData = [
  {
    id: "electronics",
    label: "Electronics",
    value: 1500,
    originalValue: 1500,
    children: [
      { id: "phones", label: "Phones", value: 800, originalValue: 800 },
      { id: "laptops", label: "Laptops", value: 700, originalValue: 700 },
    ],
  },
  {
    id: "furniture",
    label: "Furniture",
    value: 1000,
    originalValue: 1000,
    children: [
      { id: "tables", label: "Tables", value: 300, originalValue: 300 },
      { id: "chairs", label: "Chairs", value: 700, originalValue: 700 },
    ],
  },
];

const updateParentValues = (data) => {
  return data.map((item) => {
    if (item.children) {
      const updatedChildren = updateParentValues(item.children);
      const newValue = updatedChildren.reduce((sum, child) => sum + child.value, 0);
      return { ...item, value: newValue, children: updatedChildren };
    }
    return item;
  });
};

const calculateVariance = (value, originalValue) => {
  return originalValue ? ((value - originalValue) / originalValue) * 100 : 0;
};

const redistributeValues = (item, newValue) => {
  if (!item.children) return { ...item, value: newValue };
  const totalCurrent = item.children.reduce((sum, child) => sum + child.value, 0);
  const updatedChildren = item.children.map((child) => ({
    ...child,
    value: (child.value / totalCurrent) * newValue,
  }));
  return { ...item, value: newValue, children: updatedChildren };
};

const applyPercentageChange = (item, percent) => {
  if (!item.children) {
    return { ...item, value: item.value * (1 + percent / 100) };
  }
  const updatedChildren = item.children.map((child) => applyPercentageChange(child, percent));
  const newValue = updatedChildren.reduce((sum, child) => sum + child.value, 0);
  return { ...item, value: newValue, children: updatedChildren };
};

const HierarchicalTable = () => {
  const [data, setData] = useState(updateParentValues(initialData));
  const [inputs, setInputs] = useState({});
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAllocationPercent = (id, percent) => {
    if (isNaN(percent) || percent === "") return;
    setData((prevData) => updateParentValues(
      prevData.map((item) => (item.id === id || item.children?.some(child => child.id === id))
        ? applyPercentageChange(item, percent)
        : item)));
  };

  const handleAllocationValue = (id, newValue) => {
    if (isNaN(newValue) || newValue === "") return;
    setData((prevData) => updateParentValues(
      prevData.map((item) => (item.id === id || item.children?.some(child => child.id === id))
        ? redistributeValues(item, newValue)
        : item)));
  };

  const renderRows = (items, level = 0) => {
    return items.map((item) => (
      <>
        <tr key={item.id} className={level === 0 ? "bg-gray-100" : "bg-white"}>
          <td className={`pl-${level * 4} py-2 border`}>
            {item.children && (
              <button onClick={() => toggleExpand(item.id)} className="mr-2">
                {expanded[item.id] ? "▼" : "▶"}
              </button>
            )}
            {item.label}
          </td>
          <td className="py-2 border">{Number(item.value).toFixed(2)}</td>
          <td className="py-2 border">
            <input
              type="number"
              min={1}
              className="border p-1 w-20"
              onChange={(e) => setInputs({ ...inputs, [item.id]: e.target.value })}
            />
          </td>
          <td className="py-2 border">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => handleAllocationPercent(item.id, Number(inputs[item.id]))}
            >
              Percentage %
            </button>
          </td>
          <td className="py-2 border">
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={() => handleAllocationValue(item.id, Number(inputs[item.id]))}
            >
              Value
            </button>
          </td>
          <td className="py-2 border text-red-500">
            {calculateVariance(item.value, item.originalValue).toFixed(2)}%
          </td>
        </tr>
        {item.children && expanded[item.id] && renderRows(item.children, level + 1)}
      </>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Label</th>
            <th className="border p-2">Value</th>
            <th className="border p-2">Input</th>
            <th className="border p-2">Allocation %</th>
            <th className="border p-2">Allocation Val</th>
            <th className="border p-2">Variance %</th>
          </tr>
        </thead>
        <tbody>{renderRows(data)}</tbody>
      </table>
    </div>
  );
};

export default HierarchicalTable;
