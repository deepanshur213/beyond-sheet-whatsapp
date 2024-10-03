import { useEffect, useState } from "react";
import { Data, DataTable } from "./table";

function App() {
  const [data, setData] = useState<Data[]>([]);

  async function loadSheetData() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_SPREADSHEET_ID}/values/${import.meta.env.VITE_SHEET_NAME}!A1:Z?key=${import.meta.env.VITE_API_KEY}`);
    const data = await response.json();
    setData(data.values.filter((_:any, index:any) => index >= 3 && (index - 3) % 2 === 0).map((v: any) => (
      {
        source: v[0],
        date: v[1],
        name: v[2],
        number: v[3],
        no_of_seats: v[4],
        requirement: v[5],
        location: v[6],
        budget_per_seat: v[7],
        visit_planned: v[8],
        visit1:v[9],
        status: v[10],
        remarks: v[11]
      })));
  }

  useEffect(() => {
    loadSheetData();
  }, [])

  return (
    <div className="px-5 lg:px-10">
      <DataTable data={data!} />
    </div>
  )
}

export default App
