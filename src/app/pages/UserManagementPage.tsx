import "@patternfly/react-core/dist/styles/base-no-reset.css";
import "@patternfly/react-styles/css/components/Tabs/tabs.css";
import { Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import { Link, Navigate, useSearchParams } from "react-router";
import {
  BodyText,
  Container,
  PageTitle,
} from "../../imports/UIComponents";
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
  getGroupName,
  getRoleName,
  getUsersForGroup,
  MANAGED_ROLES,
  MANAGED_USERS,
  TENANT_GROUPS,
} from "../userManagement/userManagementData";

function UsersView() {
  return (
    <PfTable
      aria-label="Managed users"
      modifiers={["borderRow", "fixed"]}
      className="w-full"
    >
      <PfThead>
        <PfTr>
          <PfTh wrap width="width25">
            Name
          </PfTh>
          <PfTh wrap width="width25">
            Email
          </PfTh>
          <PfTh wrap width="width20">
            Role
          </PfTh>
          <PfTh wrap width="width20">
            Group
          </PfTh>
          <PfTh width="width10">
            Status
          </PfTh>
        </PfTr>
      </PfThead>
      <PfTbody>
        {MANAGED_USERS.map((user) => (
          <PfTr key={user.id}>
            <PfTd wrap width="width25">
              <span
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {user.name}
              </span>
            </PfTd>
            <PfTd wrap width="width25">
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {user.email}
              </span>
            </PfTd>
            <PfTd wrap width="width20">
              {getRoleName(user.roleId)}
            </PfTd>
            <PfTd wrap width="width20">
              {getGroupName(user.groupId)}
            </PfTd>
            <PfTd width="width10">
              <span
                className={
                  user.status === "active"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {user.status === "active" ? "Active" : "Inactive"}
              </span>
            </PfTd>
          </PfTr>
        ))}
      </PfTbody>
    </PfTable>
  );
}

function RolesView() {
  return (
    <PfTable
      aria-label="Managed roles"
      modifiers={["borderRow", "fixed"]}
      className="w-full"
    >
      <PfThead>
        <PfTr>
          <PfTh wrap width="width25">
            Role
          </PfTh>
          <PfTh wrap width="width55">
            Description
          </PfTh>
          <PfTh width="width20">
            Users
          </PfTh>
        </PfTr>
      </PfThead>
      <PfTbody>
        {MANAGED_ROLES.map((role) => {
          const userCount = MANAGED_USERS.filter(
            (user) => user.roleId === role.id,
          ).length;

          return (
            <PfTr key={role.id}>
              <PfTd wrap width="width25">
                <span
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {role.name}
                </span>
              </PfTd>
              <PfTd wrap width="width55">
                <span
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {role.description}
                </span>
              </PfTd>
              <PfTd width="width20">
                {userCount}
              </PfTd>
            </PfTr>
          );
        })}
      </PfTbody>
    </PfTable>
  );
}

function GroupsView() {
  return (
    <PfTable
      aria-label="Tenant groups"
      modifiers={["borderRow", "fixed"]}
      className="w-full"
    >
      <PfThead>
        <PfTr>
          <PfTh wrap width="width30">
            Group
          </PfTh>
          <PfTh wrap width="width50">
            Description
          </PfTh>
          <PfTh width="width20">
            Members
          </PfTh>
        </PfTr>
      </PfThead>
      <PfTbody>
        {TENANT_GROUPS.map((group) => {
          const members = getUsersForGroup(group.id);

          return (
            <PfTr key={group.id}>
              <PfTd wrap width="width30">
                <Link
                  to={`/user-management/groups/${group.id}`}
                  className="text-primary hover:underline"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {group.name}
                </Link>
              </PfTd>
              <PfTd wrap width="width50">
                <span
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {group.description}
                </span>
              </PfTd>
              <PfTd width="width20">
                {members.length}
              </PfTd>
            </PfTr>
          );
        })}
      </PfTbody>
    </PfTable>
  );
}

export function UserManagementPage() {
  const { isClusterAdmin } = useNavigationPreferences();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "users";

  if (!isClusterAdmin) {
    return <Navigate to="/overview" replace />;
  }

  const handleTabSelect = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    const tab = String(tabIndex);
    setSearchParams(tab === "users" ? {} : { tab });
  };

  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>User Management</PageTitle>
        <BodyText muted>
          Manage users, roles, and tenant groups for this workspace
        </BodyText>
      </div>

      <div className="max-w-5xl">
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          aria-label="User management"
          role="region"
        >
          <Tab eventKey="users" title={<TabTitleText>Users</TabTitleText>}>
            <div className="pt-6">
              <UsersView />
            </div>
          </Tab>
          <Tab eventKey="roles" title={<TabTitleText>Roles</TabTitleText>}>
            <div className="pt-6">
              <RolesView />
            </div>
          </Tab>
          <Tab eventKey="groups" title={<TabTitleText>Groups</TabTitleText>}>
            <div className="pt-6">
              <GroupsView />
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}
