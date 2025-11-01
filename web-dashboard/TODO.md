# TODO for Live Supply Chain Map Enhancement

## Current Status
- MapCard component exists with placeholder map and basic shipment markers.
- Hardcoded shipment data with positions, status, etc.
- Simple color coding: green (On-time), orange (Delayed), blue (Delivered).
- Hover tooltip shows farmer, trader, quantity, crop, expected arrival.

## Planned Changes
1. **Install Map Library**: Add react-leaflet and leaflet for a real interactive map. ✅ Done
2. **Update MapCard Component**:
   - Replace placeholder with Leaflet map centered on Ethiopia. ✅ Done
   - Add markers for each shipment with color based on status (change Delivered to red for urgency). ✅ Done
   - Implement hover tooltips with shipment details. ✅ Done
   - Add legend for status colors. ✅ Done
   - Add route visualization (e.g., polylines) for active shipments (On-time and Delayed). ✅ Done
3. **Enhance Data**: Ensure shipment data includes crop type and status. ✅ Done
4. **Styling**: Improve UI for better visualization. ✅ Done

## Next Steps
- Update MapCard.tsx with map integration. ✅ Done
- Test the component in the Overview page.
- Verify tooltips and color coding.

## Followup
- Run the app to test the map functionality.
- Consider adding real-time updates if backend supports it.
