import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getSupportTicket } from "@/app/actions/support/supportAction";

export default async function SupportPage({ params }: { params: { id: string } }) {
  const { success, ticket, error } = await getSupportTicket(params.id);

  if (!success || !ticket) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Support Ticket Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Subject" value={ticket.subject} />
            <Field label="Category" value={ticket.category} />
            <Field
              label="Priority"
              value={
                <Badge variant={getPriorityVariant(ticket.priority)} className="capitalize">
                  {ticket.priority}
                </Badge>
              }
            />
            <Field
              label="Status"
              value={
                <Badge variant={getStatusVariant(ticket.status)}>
                  {ticket.status}
                </Badge>
              }
            />
            <Field label="Created At" value={new Date(ticket.createdAt).toLocaleString()} />

            {ticket.space && (
              <Field
                label="Space"
                value={`${ticket.space.spaceCode} — ${ticket.space.name}`}
              />
            )}

            {ticket.client && (
              <Field
                label="Client"
                value={`${ticket.client.name} (${ticket.client.email})`}
                className="md:col-span-2"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Message</label>
            <div className="p-4 rounded-md bg-muted text-sm border">{ticket.message}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Updated Field component with HTML-safe rendering
function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="block font-semibold ">{label}</label>
      {typeof value === "string" || typeof value === "number" ? (
        <p className="text-sm">{value}</p>
      ) : (
        <div className="text-sm">{value}</div>
      )}
    </div>
  );
}

function getPriorityVariant(priority: string): "default" | "destructive" | "secondary" | "outline" {
  switch (priority.toLowerCase()) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status.toLowerCase()) {
    case "open":
      return "default";
    case "in progress":
      return "secondary";
    case "closed":
      return "outline";
    default:
      return "default";
  }
}
