import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

const List = () => {
  const { user } = useAuth();
  const { users, apartments, payments, maintenance } = useData();

  if (user?.role === 'tenant') {
    // Get latest 5 payments and maintenance requests for this tenant
    const userId = user.id || user.uid;
    const myPayments = payments.filter(p => p.tenantId === userId);
    const myMaintenance = maintenance.filter(m => m.tenantId === userId);
    // Normalize and combine
    const combined = [
      ...myPayments.map(p => ({
        id: p.id,
        type: p.paymentType || 'Payment',
        date: p.paymentDate ? new Date(p.paymentDate.seconds ? p.paymentDate.seconds * 1000 : p.paymentDate).toLocaleDateString() : '',
        amount: p.amount,
        method: p.paymentMethod,
        status: p.status,
      })),
      ...myMaintenance.map(m => ({
        id: m.id,
        type: m.issue || 'Maintenance',
        date: m.requestDate ? new Date(m.requestDate.seconds ? m.requestDate.seconds * 1000 : m.requestDate).toLocaleDateString() : '',
        amount: 0,
        method: 'Maintenance Request',
        status: m.status,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return (
      <TableContainer component={Paper} className="table">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className="tableCell">Transaction ID</TableCell>
              <TableCell className="tableCell">Type</TableCell>
              <TableCell className="tableCell">Date</TableCell>
              <TableCell className="tableCell">Amount</TableCell>
              <TableCell className="tableCell">Method</TableCell>
              <TableCell className="tableCell">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combined.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="tableCell">{row.id}</TableCell>
                <TableCell className="tableCell">{row.type}</TableCell>
                <TableCell className="tableCell">{row.date}</TableCell>
                <TableCell className="tableCell">
                  {row.amount > 0 ? `₱${row.amount}` : "N/A"}
                </TableCell>
                <TableCell className="tableCell">{row.method}</TableCell>
                <TableCell className="tableCell">
                  <span className={`status ${row.status?.toLowerCase()}`}>{row.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Admin: show latest 5 payments
  const latestPayments = payments
    .sort((a, b) => {
      const dateA = a.paymentDate ? new Date(a.paymentDate.seconds ? a.paymentDate.seconds * 1000 : a.paymentDate) : 0;
      const dateB = b.paymentDate ? new Date(b.paymentDate.seconds ? b.paymentDate.seconds * 1000 : b.paymentDate) : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <TableContainer component={Paper} className="table">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="tableCell">Payment ID</TableCell>
            <TableCell className="tableCell">Tenant</TableCell>
            <TableCell className="tableCell">Apartment</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Method</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {latestPayments.map((row) => {
            const tenant = users.find(u => u.id === row.tenantId || u.uid === row.tenantId);
            const apartment = apartments.find(a => a.id === row.apartmentId);
            return (
              <TableRow key={row.id}>
                <TableCell className="tableCell">{row.id}</TableCell>
                <TableCell className="tableCell">{tenant ? (tenant.fullName || tenant.username || tenant.email) : 'N/A'}</TableCell>
                <TableCell className="tableCell">{apartment ? apartment.apartmentNumber : 'N/A'}</TableCell>
                <TableCell className="tableCell">{row.paymentDate ? new Date(row.paymentDate.seconds ? row.paymentDate.seconds * 1000 : row.paymentDate).toLocaleDateString() : ''}</TableCell>
                <TableCell className="tableCell">{row.amount ? `₱${row.amount}` : 'N/A'}</TableCell>
                <TableCell className="tableCell">{row.paymentMethod}</TableCell>
                <TableCell className="tableCell">
                  <span className={`status ${row.status}`}>{row.status}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default List;
