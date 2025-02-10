import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaBox,
  FaTimes,
  FaEdit,
  FaPaperPlane,
  FaBuilding
} from "react-icons/fa";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: any;
  isAdmin: boolean;
}

interface Ticket {
  id: string;
  title: string;
  sender: string;
  company: string;
  location: string;
  date: string;
  time: string;
  severity: string;
  status: string;
  quantity: string;
  ticketDetails: string;
  notes: string;
  ownerEmail: string;
  ownerId: string;
  hasUnreadMessages?: boolean;
  lastMessageAt?: any;
  lastMessageBy?: string;
}

interface TicketDetailsProps {
  ticket: Ticket;
  onClose: () => void;
  isAdmin: boolean;
}

const severityOptions = ["Low", "Medium", "High", "Critical"] as const;
const statusOptions = ["Open", "In Progress", "Resolved"] as const;

const severityStyles = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const statusStyles = {
  Open: "bg-blue-100 text-blue-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Resolved: "bg-green-100 text-green-800",
};

export default function TicketDetails({
  ticket,
  onClose,
  isAdmin,
}: TicketDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const auth = getAuth();

  const [editedTicket, setEditedTicket] = useState({
    title: ticket.title,
    location: ticket.location,
    severity: ticket.severity,
    status: ticket.status,
    notes: ticket.notes,
    ticketDetails: ticket.ticketDetails || '',
    quantity: ticket.quantity
  });

  const [senderCompany, setSenderCompany] = useState<string>('');

  useEffect(() => {
    setEditedTicket({
      title: ticket.title,
      location: ticket.location,
      severity: ticket.severity,
      status: ticket.status,
      notes: ticket.notes,
      ticketDetails: ticket.ticketDetails || '',
      quantity: ticket.quantity
    });
  }, [ticket]);

  useEffect(() => {
    const fetchSenderCompany = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', ticket.sender));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            setSenderCompany(userData.company || 'N/A');
          }
        });
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching sender company:', error);
        return () => {};
      }
    };

    if (ticket.sender) {
      fetchSenderCompany();
    }
  }, [ticket.sender]);

  useEffect(() => {
    const messagesRef = collection(db, "tickets", ticket.id, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messageData);
    });

    return () => unsubscribe();
  }, [ticket.id]);

  useEffect(() => {
    if (ticket) {
      const ticketRef = doc(db, 'tickets', ticket.id);
      updateDoc(ticketRef, {
        hasUnreadMessages: false
      }).catch(error => {
        console.error('Error updating unread status:', error);
      });
    }
  }, [ticket]);

  const handleUpdateTicket = async () => {
    if (!isAdmin) {
      alert("Only administrators can modify tickets");
      return;
    }

    try {
      const ticketRef = doc(db, 'tickets', ticket.id);
      await updateDoc(ticketRef, {
        title: editedTicket.title,
        location: editedTicket.location,
        severity: editedTicket.severity,
        status: editedTicket.status,
        notes: editedTicket.notes,
        ticketDetails: editedTicket.ticketDetails,
        quantity: editedTicket.quantity,
        updatedAt: serverTimestamp()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      // Add message to messages collection
      const messagesRef = collection(db, 'tickets', ticket.id, 'messages');
      const messageDoc = await addDoc(messagesRef, {
        content: newMessage,
        sender: auth.currentUser?.email || 'Unknown',
        isAdmin: true,
        timestamp: serverTimestamp(),
      });

      // Update ticket with unread message flag
      const ticketRef = doc(db, 'tickets', ticket.id);
      await updateDoc(ticketRef, {
        hasUnreadMessages: true,
        lastMessageAt: serverTimestamp(),
        lastMessageBy: auth.currentUser?.email || 'Unknown'
      });

      // Create notification
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        ticketId: ticket.id,
        title: `New Message in Ticket #${ticket.id}`,
        message: `${auth.currentUser?.email || 'Unknown'} sent: ${newMessage.slice(0, 100)}${newMessage.length > 100 ? '...' : ''}`,
        read: false,
        createdAt: serverTimestamp(),
        type: 'message',
        messageId: messageDoc.id
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {ticket.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Status and Severity */}
        <div className="flex items-center space-x-4 mb-6">
          {isEditing ? (
            <>
              <select
                value={editedTicket.severity}
                onChange={(e) =>
                  setEditedTicket({ ...editedTicket, severity: e.target.value })
                }
                className="px-3 py-1 text-sm font-semibold rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={editedTicket.status}
                onChange={(e) =>
                  setEditedTicket({ ...editedTicket, status: e.target.value })
                }
                className="px-3 py-1 text-sm font-semibold rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateTicket}
                  disabled={loading}
                  className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTicket({
                      title: ticket.title,
                      location: ticket.location,
                      severity: ticket.severity,
                      status: ticket.status,
                      notes: ticket.notes,
                      ticketDetails: ticket.ticketDetails || '',
                      quantity: ticket.quantity
                    });
                  }}
                  className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  severityStyles[ticket.severity]
                }`}
              >
                {ticket.severity}
              </span>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  statusStyles[ticket.status]
                }`}
              >
                {ticket.status}
              </span>
              {isAdmin && ( // Made this condition more explicit
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-1 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-white rounded-lg shadow-sm"
                >
                  <FaEdit className="mr-1" />
                  Edit Status
                </button>
              )}
              <span className="text-sm text-gray-500 flex items-center ml-auto">
                <FaClock className="mr-1.5" />
                {ticket.date} • {ticket.time}
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Sender Information */}
          <div className="col-span-1">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Ticket Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <FaUser className="text-gray-400 mr-2" />
                  <span className="text-gray-900">{ticket.sender}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FaMapMarkerAlt className="text-gray-400 mr-2" />
                  <span className="text-gray-900">{ticket.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FaBuilding className="text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {senderCompany || 'Loading...'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <FaClock className="text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {ticket.date} • {ticket.time}
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Details
                </h3>
                <textarea
                  value={editedTicket.ticketDetails}
                  onChange={(e) =>
                    setEditedTicket({ ...editedTicket, ticketDetails: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={!isAdmin}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Ticket Details
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {ticket.ticketDetails}
                </p>
              </div>
            )}
            {isEditing ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </h3>
                <textarea
                  value={editedTicket.notes}
                  onChange={(e) =>
                    setEditedTicket({ ...editedTicket, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={!isAdmin}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {ticket.notes}
                </p>
              </div>
            )}
          </div>

          {/* Messages Section */}
          <div className="col-span-2 flex flex-col">
            <div className="bg-gray-50 p-4 rounded-lg flex-1 mb-4 max-h-[400px] overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Conversation
              </h3>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.isAdmin
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {message.sender} •{" "}
                        {message.timestamp?.toDate().toLocaleString()}
                      </div>
                      <div className="text-sm">{message.content}</div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={sendingMessage}
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaPaperPlane className="text-sm" />
                {sendingMessage ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
