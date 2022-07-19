// import React from 'react'
// import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
// import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
// import { IconButton } from './Button'
// import { PencilSimple, Trash } from 'phosphor-react'
// import { isDarkTheme } from '../../lib/themeUpdater'
// import { Box, SpanBox } from './LayoutPrimitives'
// import { StyledText } from './StyledText'

// interface TableProps {
//   heading: string
//   infoLink?: string
//   onAdd?: () => void
//   headers: string[]
//   rows: Map<string, Record<string, any>>
//   onDelete?: (id: string) => void
//   onEdit?: (obj: any) => void
// }

// export default function TableR(props: TableProps): JSX.Element {
//   const { headers } = props
//   const iconColor = isDarkTheme() ? '#D8D7D5' : '#5F5E58'
//   return (
//     <>
//       <Box css={{ml:'25px'}}>
//         <StyledText style="fixedHeadline">{props.heading}</StyledText>
//       </Box>
//       <Box
//         css={{
//           backgroundColor: '$grayBg',
//           margin: ' 0 auto',
//           border: '0.5px solid $grayBgActive',
//           width: '95%',
//           mt: '$3',
//           '&:hover': {
//             border: '0.5px solid #FFD234',
//           },
//         }}
//       >
//         <Table>
//           <Thead>
//             <Tr>
//               {headers.map((header: string, index: number) => (
//                 <Th key={index}>
//                   <SpanBox
//                     css={{
//                       textTransform: 'uppercase',
//                       display: 'flex',
//                       fontWeight: 600,
//                       padding: '20px 10px',
//                       color: '$grayTextContrast',
//                       fontSize: '$2',
//                     }}
//                   >
//                     {header}
//                   </SpanBox>
//                 </Th>
//               ))}
//             </Tr>
//           </Thead>
//           <Tbody>
//             {Array.from(props.rows.keys()).map((key, index) => (
//               <Tr key={index}>
//                 {Object.values(props.rows.get(key) || {}).map((cell, index) => (
//                   <Td key={index}>
//                     <SpanBox
//                       key={index}
//                       css={{
//                         display: 'flex',
//                         justifyContent: 'left',
//                         padding: '15px 10px',
//                         color: '$grayTextContrast',
//                         fontSize: '$1',
//                       }}
//                     >
//                       {cell}
//                     </SpanBox>
//                   </Td>
//                 ))}

//                 {props.onDelete && (
//                   <Td>
//                     <IconButton
//                       style="ctaWhite"
//                       css={{ mr: '$1', background: '$labelButtonsBg' }}
//                       onClick={() => {
//                         props.onDelete && props.onDelete(key)
//                       }}
//                     >
//                       <Trash size={16} color={iconColor} />
//                     </IconButton>
//                   </Td>
//                 )}
//                 {props.onEdit && (
//                   <Td>
//                     <IconButton
//                       style="ctaWhite"
//                       css={{ mr: '$1', background: '$labelButtonsBg' }}
//                       onClick={() => {
//                         props.onEdit &&
//                           props.onEdit({ ...props.rows.get(key), id: key })
//                       }}
//                     >
//                       <PencilSimple size={24} color={iconColor} />
//                     </IconButton>
//                   </Td>
//                 )}
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       </Box>
//     </>
//   )
// }
