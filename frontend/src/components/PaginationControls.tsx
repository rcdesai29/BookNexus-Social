import { Box, FormControl, InputLabel, MenuItem, Pagination, Select, Typography } from '@mui/material';
import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  loading?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 16, 24, 48],
  loading = false
}) => {
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value - 1); // Material UI Pagination is 1 based! backend is 0 based!
  };

  const handlePageSizeChange = (event: any) => {
    onPageSizeChange(event.target.value);
  };

  if (totalPages <= 1 || totalElements === 0) {
    return null;
  }

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mt: 4,
      flexWrap: 'wrap',
      gap: 2,
      flexDirection: { xs: 'column', sm: 'row' }
    }}>
      <Typography variant="body2" color="text.secondary">
        Showing {startItem}-{endItem} of {totalElements} items
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        width: { xs: '100%', sm: 'auto' }
      }}>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel>Size</InputLabel>
          <Select
            value={pageSize}
            label="Size"
            onChange={handlePageSizeChange}
            disabled={loading}
          >
            {pageSizeOptions.map(size => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Pagination
          count={totalPages}
          page={currentPage + 1}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
          size="small"
          disabled={loading}
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default PaginationControls;
