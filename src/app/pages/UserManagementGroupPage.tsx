import { Link, Navigate, useParams } from "react-router";
import {
  BodyText,
  Container,
  PageTitle,
} from "../../imports/UIComponents";
import { GroupNavigationSettings } from "../components/GroupNavigationSettings";
import { useNavigationPreferences } from "../contexts/NavigationPreferencesContext";
import {
  PfTable,
  PfTbody,
  PfTd,
  PfTh,
  PfThead,
  PfTr,
} from "../components/patternfly-table";
import {
  getRoleName,
  getTenantGroup,
  getUsersForGroup,
  type TenantGroupId,
} from "../userManagement/userManagementData";

const sectionHeadingStyle = {
  fontFamily: "var(--font-family-display)",
  fontSize: "var(--text-lg)",
  fontWeight: "var(--font-weight-medium)",
} as const;

const breadcrumbLinkStyle = {
  fontFamily: "var(--font-family-text)",
  fontSize: "var(--text-sm)",
  color: "var(--primary)",
} as const;

const breadcrumbTextStyle = {
  fontFamily: "var(--font-family-text)",
  fontSize: "var(--text-sm)",
  color: "var(--muted-foreground)",
} as const;

function GroupMembersTable({ groupId }: { groupId: TenantGroupId }) {
  const members = getUsersForGroup(groupId);

  return (
    <PfTable
      aria-label="Group members"
      modifiers={["borderRow", "fixed"]}
      className="w-full"
    >
      <PfThead>
        <PfTr>
          <PfTh wrap width="width30">
            Name
          </PfTh>
          <PfTh wrap width="width30">
            Email
          </PfTh>
          <PfTh wrap width="width25">
            Role
          </PfTh>
          <PfTh width="width15">
            Status
          </PfTh>
        </PfTr>
      </PfThead>
      <PfTbody>
        {members.map((user) => (
          <PfTr key={user.id}>
            <PfTd wrap width="width30">
              <span style={breadcrumbTextStyle}>{user.name}</span>
            </PfTd>
            <PfTd wrap width="width30">
              <span className="text-muted-foreground" style={breadcrumbTextStyle}>
                {user.email}
              </span>
            </PfTd>
            <PfTd wrap width="width25">
              {getRoleName(user.roleId)}
            </PfTd>
            <PfTd width="width15">
              {user.status === "active" ? "Active" : "Inactive"}
            </PfTd>
          </PfTr>
        ))}
      </PfTbody>
    </PfTable>
  );
}

export function UserManagementGroupPage() {
  const { groupId } = useParams();
  const { isClusterAdmin } = useNavigationPreferences();
  const group = groupId ? getTenantGroup(groupId) : undefined;

  if (!isClusterAdmin) {
    return <Navigate to="/overview" replace />;
  }

  if (!group || !groupId) {
    return <Navigate to="/user-management?tab=groups" replace />;
  }

  const members = getUsersForGroup(group.id);

  return (
    <Container className="p-8">
      <div className="mb-6 flex items-center gap-2">
        <Link to="/user-management" className="hover:underline" style={breadcrumbLinkStyle}>
          User Management
        </Link>
        <svg
          className="size-[16px]"
          fill="none"
          viewBox="0 0 16 16"
          style={{ color: "var(--muted-foreground)" }}
          aria-hidden
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Link
          to="/user-management?tab=groups"
          className="hover:underline"
          style={breadcrumbLinkStyle}
        >
          Groups
        </Link>
        <svg
          className="size-[16px]"
          fill="none"
          viewBox="0 0 16 16"
          style={{ color: "var(--muted-foreground)" }}
          aria-hidden
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={breadcrumbTextStyle}>{group.name}</span>
      </div>

      <div className="mb-8">
        <PageTitle>{group.name}</PageTitle>
        <BodyText muted>{group.description}</BodyText>
      </div>

      <div className="flex max-w-5xl flex-col gap-8">
        <section
          className="rounded-lg border p-6"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="mb-4" style={sectionHeadingStyle}>
            Group information
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt
                className="mb-1 text-muted-foreground"
                style={breadcrumbTextStyle}
              >
                Tenant
              </dt>
              <dd style={breadcrumbTextStyle}>{group.name}</dd>
            </div>
            <div>
              <dt
                className="mb-1 text-muted-foreground"
                style={breadcrumbTextStyle}
              >
                Members
              </dt>
              <dd style={breadcrumbTextStyle}>{members.length}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt
                className="mb-1 text-muted-foreground"
                style={breadcrumbTextStyle}
              >
                Description
              </dt>
              <dd style={breadcrumbTextStyle}>{group.description}</dd>
            </div>
          </dl>
        </section>

        <section
          className="rounded-lg border p-6"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="mb-4" style={sectionHeadingStyle}>
            Navigation settings
          </h2>
          <GroupNavigationSettings
            groupId={group.id}
            groupName={group.name}
            embedded
          />
        </section>

        <section
          className="rounded-lg border p-6"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="mb-4" style={sectionHeadingStyle}>
            Users
          </h2>
          <GroupMembersTable groupId={group.id} />
        </section>
      </div>
    </Container>
  );
}
