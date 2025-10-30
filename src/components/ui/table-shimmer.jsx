import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function TableShimmer({ rows = 5, columns = 6 }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={index} className="text-gray-400 font-semibold">
                <div className="h-4 bg-white/10 rounded animate-pulse w-20"></div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-white/5">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <div className="space-y-2">
                    <div 
                      className={`h-4 bg-white/5 rounded animate-pulse ${
                        colIndex === 0 ? 'w-32' : 
                        colIndex === 1 ? 'w-24' : 
                        colIndex === columns - 1 ? 'w-16' : 
                        'w-20'
                      }`}
                      style={{
                        animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s`
                      }}
                    ></div>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TableShimmerWithBadges({ rows = 5 }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-gray-400 font-semibold">
              <div className="h-4 bg-white/10 rounded animate-pulse w-16"></div>
            </TableHead>
            <TableHead className="text-gray-400 font-semibold">
              <div className="h-4 bg-white/10 rounded animate-pulse w-20"></div>
            </TableHead>
            <TableHead className="text-gray-400 font-semibold text-center">
              <div className="h-4 bg-white/10 rounded animate-pulse w-20 mx-auto"></div>
            </TableHead>
            <TableHead className="text-gray-400 font-semibold text-center">
              <div className="h-4 bg-white/10 rounded animate-pulse w-20 mx-auto"></div>
            </TableHead>
            <TableHead className="text-gray-400 font-semibold text-center">
              <div className="h-4 bg-white/10 rounded animate-pulse w-16 mx-auto"></div>
            </TableHead>
            <TableHead className="text-gray-400 font-semibold text-right">
              <div className="h-4 bg-white/10 rounded animate-pulse w-16 ml-auto"></div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-white/5">
              {/* Name */}
              <TableCell>
                <div 
                  className="h-4 bg-white/5 rounded animate-pulse w-40"
                  style={{ animationDelay: `${rowIndex * 0.1}s` }}
                ></div>
              </TableCell>
              
              {/* Location */}
              <TableCell>
                <div 
                  className="h-4 bg-white/5 rounded animate-pulse w-32"
                  style={{ animationDelay: `${rowIndex * 0.1 + 0.05}s` }}
                ></div>
              </TableCell>
              
              {/* Students Badge */}
              <TableCell className="text-center">
                <div className="inline-flex items-center justify-center">
                  <div 
                    className="h-6 bg-cyan-500/10 rounded-full animate-pulse w-12"
                    style={{ animationDelay: `${rowIndex * 0.1 + 0.1}s` }}
                  ></div>
                </div>
              </TableCell>
              
              {/* Teachers Badge */}
              <TableCell className="text-center">
                <div className="inline-flex items-center justify-center">
                  <div 
                    className="h-6 bg-purple-500/10 rounded-full animate-pulse w-12"
                    style={{ animationDelay: `${rowIndex * 0.1 + 0.15}s` }}
                  ></div>
                </div>
              </TableCell>
              
              {/* Status Badge */}
              <TableCell className="text-center">
                <div className="inline-flex items-center justify-center">
                  <div 
                    className="h-6 bg-green-500/10 rounded-full animate-pulse w-16"
                    style={{ animationDelay: `${rowIndex * 0.1 + 0.2}s` }}
                  ></div>
                </div>
              </TableCell>
              
              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <div 
                    className="h-8 w-8 bg-white/5 rounded animate-pulse"
                    style={{ animationDelay: `${rowIndex * 0.1 + 0.25}s` }}
                  ></div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
