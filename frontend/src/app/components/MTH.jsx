"use client"
import { useConfigurator } from '../contexts/Configurator';
import { useState } from 'react';
const MTH = ({}) => {
    const [viewIndex,setViewIndex] = useState(0);
    const attrs = useConfigurator();
    const matrices = [attrs.matrix,attrs.matrix1,attrs.matrix2,attrs.matrix3,attrs.matrix4]
    const buttons = [
        { label: '1_2', index: 1 },
        { label: '2_3', index: 2 },
        { label: '3_4', index: 3 },
        { label: '4_5', index: 4 },
        { label: 'Final', index: 0 },
      ];
    return (
  
        <div className="flex flex-col bg-white text-black items-center">
          <div className="flex flex-row justify-start w-full bg-muted mb-[20%]">
          {buttons.map(({ label, index }) => (
                <button
                key={label}
                className={`
                    px-3 py-1.5 text-black text-[12px] rounded font-bold
                    ${viewIndex === index ? 'bg-background' : 'bg-muted'}
                    hover:bg-background/80 transition-colors
                `}
                onClick={() => setViewIndex(index)}
                >
                {label}
                </button>
            ))}
          </div>
          <h2 className="text-[14px] mb-2 text-black">{viewIndex == 0?"MTH Total":"MTH" + (viewIndex)+"_"+(viewIndex+1)}</h2>
          <div className="bg-white border-l-2 border-r-2 border-black">
            <table className="border-collapse">
              <tbody>
                {matrices[viewIndex].map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className="w-12 h-12 text-center font-mono text-lg"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
    
    );
    };
export default MTH