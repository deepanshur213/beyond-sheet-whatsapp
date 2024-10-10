import { useEffect, useState } from "react";
import { Data, DataTable } from "./table";
import { Input } from "./components/ui/input";

function App() {
  const [data, setData] = useState<Data[]>([]);
  const [password, setPassword] = useState<string>('');

  async function loadSheetData() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_SPREADSHEET_ID}/values/${import.meta.env.VITE_SHEET_NAME}!A1:Z?key=${import.meta.env.VITE_API_KEY}`);
    const data = await response.json();
    setData(data.values.filter((_:any, index:any) => index >= 3 && (index - 3) % 2 === 0).map((v: any) => (
      {
        source: v[0],
        date: v[1],
        name: v[2],
        number: v[3],
        requirement: v[4],
        location: v[5],
        budget_per_seat: v[6],
        visit_planned: v[7],
        visit1:v[8],
        status: v[9],
        remarks: v[10]
      })));
  }

  useEffect(() => {
    loadSheetData();
  }, [])

  return (
    <div className="px-5 lg:px-10">
      {password!='beyondsheet'&&<div className="fixed top-0 left-0 w-screen h-screen z-[999999999] bg-black bg-opacity-30 flex justify-center items-center">
        <div className="flex flex-col items-center justify-center bg-white p-2">
          Password
          <Input value={password} placeholder="Enter password" onChange={(e)=>setPassword(e.target.value)}/>
        </div>
      </div>}
      <DataTable data={data!} />
    </div>
  )
}

export default App
