import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Phone, Heart, Shield, Plus, Trash2, LogOut, Check, Edit3 } from "lucide-react";
import { DEMO_USER } from "@/data/mock";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  SectionTitle,
  DemoBadge,
} from "@/components/common/Primitives";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Patient Profile & Emergency Contacts — LifeRoute" },
      {
        name: "description",
        content: "Manage vital health stats, allergies, and emergency ICE contacts.",
      },
    ],
  }),
  component: ProfilePage,
});

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(DEMO_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    setProfile((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: newContactName, relation: newContactRelation || "Contact", phone: newContactPhone },
      ],
    }));
    setNewContactName("");
    setNewContactRelation("");
    setNewContactPhone("");
    setShowAddContact(false);
  };

  const handleDeleteContact = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Patient Profile"
        description="These clinical metrics are automatically dispatched to paramedics upon ambulance request."
      >
        <div className="flex items-center gap-2">
          <DemoBadge />
          <Button
            variant={isEditing ? "primary" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="h-4 w-4" /> {isEditing ? "Editing Mode" : "Edit Profile"}
          </Button>
        </div>
      </PageHeader>

      {savedToast && (
        <div className="rounded-xl border border-success/40 bg-success-soft p-3 text-sm font-semibold text-success flex items-center gap-2">
          <Check className="h-4 w-4" /> Profile updated and synchronized with Emergency Dispatch
          Hub.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main stats card */}
        <Card className="md:col-span-1 flex flex-col items-center p-6 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-primary text-3xl font-extrabold text-primary-foreground shadow-lg">
            {profile.name.charAt(0)}
          </span>
          <h2 className="mt-4 text-xl font-bold">{profile.fullName}</h2>
          <p className="text-xs text-muted-foreground">{profile.language} · Account ID #LR-99214</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Pill tone="emergency">Blood {profile.bloodGroup}</Pill>
            <Pill tone="muted">{profile.age} Yrs</Pill>
            <Pill tone="success">ABHA Linked</Pill>
          </div>

          <div className="mt-6 w-full border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={() => navigate({ to: "/login" })}
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </Card>

        {/* Clinical metrics */}
        <Card className="md:col-span-2">
          <SectionTitle
            icon={<Heart className="h-4 w-4" />}
            title="Vital Clinical Background"
            subtitle="Shared with attending ER physicians and paramedics"
          />

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Blood Group
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm disabled:opacity-75 font-bold text-emergency"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Known Allergies
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.allergies.join(", ")}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      allergies: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Active Medications
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.medications.join(", ")}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      medications: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm disabled:opacity-75"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Pre-existing Medical Conditions
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.conditions.join(", ")}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      conditions: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm disabled:opacity-75"
                />
              </div>
            </div>

            {isEditing && (
              <Button type="submit" size="sm" className="mt-2">
                Save Clinical Profile
              </Button>
            )}
          </form>
        </Card>
      </div>

      {/* Emergency contacts */}
      <Card>
        <SectionTitle
          icon={<Phone className="h-4 w-4" />}
          title="In Case of Emergency (ICE) Contacts"
          subtitle="Alerted with live GPS tracking link when SOS is triggered"
          action={
            <Button size="sm" variant="outline" onClick={() => setShowAddContact(!showAddContact)}>
              <Plus className="h-4 w-4" /> Add Contact
            </Button>
          }
        />

        {showAddContact && (
          <form
            onSubmit={handleAddContact}
            className="mt-4 rounded-xl border border-border p-4 bg-muted/30 space-y-3"
          >
            <h4 className="text-xs font-bold uppercase text-foreground">New Emergency Contact</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
              />
              <input
                type="text"
                placeholder="Relation (e.g. Spouse, Father)"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number (+91 ...)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Save Contact
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddContact(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {profile.emergencyContacts.map((contact, index) => (
            <div
              key={contact.phone + index}
              className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"
            >
              <div>
                <p className="font-bold text-foreground">{contact.name}</p>
                <p className="text-xs text-muted-foreground">
                  {contact.relation} · {contact.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`tel:${contact.phone}`}>
                  <Button variant="outline" size="sm">
                    <Phone className="h-3.5 w-3.5" /> Call
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete contact"
                  onClick={() => handleDeleteContact(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
