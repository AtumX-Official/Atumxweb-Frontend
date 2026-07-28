import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Book from "../assets/Files";

interface Example {
    filename: string
    filepath: string
}

function BlockSamples() {

    const [examples, setExamples] = useState<Example[]>([]);
    const navigate = useNavigate();

    // useEffect(() => {
    //     const fetchAllExamples = async () => {
    //         try {
    //             const result = await window.api.file.fetchExamples('blockly');
    //             if (result.success) {
    //                 setExamples(result.data)
    //             } else {
    //                 console.error('Error fetching Examples:', result.error)
    //             }
    //         } catch (err: any) {
    //             console.log(err)
    //         }
    //     }
    //     fetchAllExamples()
    // }, []);

    return (
    
    <div className="p-6">

       {/* Back Button */}
      <button
        onClick={() => navigate("/blocks")}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
        ← Back
      </button>
      <h1 className="text-lg font-bold mb-6">Block Samples</h1>

      <div className="grid grid-cols-5 gap-8">
        {examples.map((example) => (
          <button
            key={example.filename}
            className="flex flex-col items-center gap-3 hover:scale-105 transition cursor-pointer"
            // onClick={() => {
            //   console.log("File clicked", example.filename);
            //   window.api.openExampleFile(
            //     example.filepath,
            //     example.filename
            //   );
            // }}
          >
            <Book className="w-[60px] h-[60px]" />
            <span className="text-sm font-medium text-center">
              {example.filename}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default BlockSamples;