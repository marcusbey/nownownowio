import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageSquare, UserPlus, BarChart } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Typography variant="h2">Dashboard</Typography>
        <Button>Invite member</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2 mb-2">
            <HeartIcon className="size-4 text-rose-500" />
            <Typography variant="small" className="text-muted-foreground">
              Total likes
            </Typography>
          </div>
          <Typography variant="h3">12,032</Typography>
          <Typography variant="small" className="text-muted-foreground">
            +4.5% from last month
          </Typography>
        </Card>

        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="size-4 text-blue-500" />
            <Typography variant="small" className="text-muted-foreground">
              Total Threads
            </Typography>
          </div>
          <Typography variant="h3">124</Typography>
          <Typography variant="small" className="text-muted-foreground">
            +2.5% from last month
          </Typography>
        </Card>

        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="size-4 text-green-500" />
            <Typography variant="small" className="text-muted-foreground">
              New subscribers
            </Typography>
          </div>
          <Typography variant="h3">+1,288</Typography>
          <Typography variant="small" className="text-muted-foreground">
            +12.3% from last month
          </Typography>
        </Card>

        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="size-4 text-yellow-500" />
            <Typography variant="small" className="text-muted-foreground">
              Impressions
            </Typography>
          </div>
          <Typography variant="h3">120,011</Typography>
          <Typography variant="small" className="text-muted-foreground">
            +3.2% from last month
          </Typography>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className="p-6">
        <Typography variant="h4">New users</Typography>
        <Typography variant="small" className="text-muted-foreground mb-4">
          Showing new users for the last 6 months compared to the previous year
        </Typography>
        <div className="h-[300px] flex items-center justify-center">
          <Typography className="text-muted-foreground">
            Chart component will be implemented here
          </Typography>
        </div>
        <div className="mt-2">
          <Typography variant="small" className="text-muted-foreground">
            Trending up by 5.2% this month • January - June 2024
          </Typography>
        </div>
      </Card>
    </div>
  );
}
