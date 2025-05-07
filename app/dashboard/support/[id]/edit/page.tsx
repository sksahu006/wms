"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { getSupportTicket, updateSupportTicket } from "@/app/actions/support/supportAction"

export default function EditTicketPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        if (!params?.id || typeof params.id !== "string") {
          throw new Error("Invalid ticket ID");
        }
        const data = await getSupportTicket(params.id);
        if (!data.success) throw new Error(data.error || "Failed to load ticket");

        setStatus(data.ticket?.status || "")
        setPriority(data.ticket?.priority || "")
        setComment(data.ticket?.message || "")
      } catch (err) {
      
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchTicket()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData()
    formData.append("status", status)
    formData.append("priority", priority)
    formData.append("comment", comment)

    const result = await updateSupportTicket(id, formData)
    setSubmitting(false)

    if (result.success) {
      router.push(`/dashboard/support/${id}`)
    } else {
      alert(result.error)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto space-y-6  p-6 rounded-xl shadow"
    >
      <h2 className="text-2xl font-semibold">Edit Ticket</h2>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger id="priority">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment or internal note"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Updating..." : "Update Ticket"}
      </Button>
    </form>
  )
}
