// src/components/ServiceBadge.jsx
export function ServiceBadge({ vehicle }) {
  if (vehicle.is_service_due) {
    return (
      <span className="badge badge-due">
        <span className="badge-dot" />
        Service due
      </span>
    );
  }
  if (vehicle.is_service_due_soon) {
    return (
      <span className="badge badge-soon">
        <span className="badge-dot" />
        Due soon
      </span>
    );
  }
  return (
    <span className="badge badge-ok">
      <span className="badge-dot" />
      OK
    </span>
  );
}
