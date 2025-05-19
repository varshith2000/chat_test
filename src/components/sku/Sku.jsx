import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Box,
  Alert,
} from "@mui/material";

const SkuCardSection = ({ title, content }) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardContent>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">{title}</Typography>
        <Button size="small" variant="outlined">
          EDIT
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {content}
      </Typography>
    </CardContent>
  </Card>
);

const SkuCard = () => {
  return (
    <Box p={4} border="1px solid #88bfe8" borderRadius={16}>
      {/* Top Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          SKU CARD
        </Typography>
        {/* <Alert severity="warning" sx={{ py: 0.5, px: 2 }}>
          Warning Actions Notification
        </Alert> */}
      </Box>

      {/* Grid Sections */}
      <Grid container spacing={3}>
        {/* SKU Image */}
        <Grid item xs={12} md={4}>
          <SkuCardSection
            title="SKU Image"
            content={
              <>
                <Box
                  sx={{
                    height: 100,
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#888",
                    mb: 2,
                    borderRadius: 1,
                  }}
                >
                  Image Placeholder (FG)
                </Box>
              </>
            }
          />
        </Grid>

        {/* SKU Description and Details */}
        <Grid item xs={12} md={4}>
          <SkuCardSection
            title="SKU Description and Details"
            content="Production Process, Job Works, Manufacturing Partners, Cost/Reconciliation Alerts"
          />
        </Grid>

        {/* SKU Mapping Table */}
        <Grid item xs={12} md={4}>
          <SkuCardSection
            title="SKU Mapping Table"
            content="Inventory Status, Warehouse Map, Transfer Stock Alerts"
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {/* SKU Image */}
        <Grid item xs={12} md={4}>
        <SkuCardSection
          title="SKU Description and Details"
          content="Raw Materials, Procurement Info, Alerts"
        />
      </Grid>

        {/* SKU Description and Details */}
        <Grid item xs={12} md={4}>
          <SkuCardSection
            title="SKU Description and Details"
            content="Production Process, Job Works, Manufacturing Partners, Cost/Reconciliation Alerts"
          />
        </Grid>

        {/* SKU Mapping Table */}
        <Grid item xs={12} md={4}>
          <SkuCardSection
            title="SKU Mapping Table"
            content="Inventory Status, Warehouse Map, Transfer Stock Alerts"
          />
        </Grid>
      </Grid>
      

      {/* Bottom Warning */}
      {/* <Box display="flex" justifyContent="flex-end" mt={4}>
        <Alert severity="warning" sx={{ py: 0.5, px: 2 }}>
          Warning Actions Notification
        </Alert>
      </Box> */}
    </Box>
  );
};

export default SkuCard;
