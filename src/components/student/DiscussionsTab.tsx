
import React from 'react';
import { Plus, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { T } from '@/components/T';

interface DiscussionsTabProps {
  discussions: any[];
}

const DiscussionsTab: React.FC<DiscussionsTabProps> = ({ discussions }) => {
  const { toast } = useToast();
  
  const handleDiscussionJoin = (id: number) => {
    toast({
      title: "Discussion Joined",
      description: "You have joined the discussion. New messages will appear here.",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-edu-card-bg border-none">
        <CardHeader className="flex flex-row-2 items-center justify-between">
          <div>
            <CardTitle><T>Study Groups & Discussions</T></CardTitle>
            <CardDescription className="text-gray-400"><T>Connect with peers and discuss course content</T></CardDescription>
          </div>
          <Button size="sm" className="bg-edu-purple hover:bg-edu-purple-light">
            <Plus size={16} className="mr-1" />
            <T>New Topic</T>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {discussions.map(discussion => (
              <div key={discussion.id} className="p-4 bg-edu-dark/30 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{discussion.title}</h3>
                    <p className="text-xs text-gray-400">{discussion.course} • <T>replies</T>: {discussion.replies}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {discussion.lastActive}
                  </span>
                </div>
                <div className="mt-3 flex gap-2 justify-center">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDiscussionJoin(discussion.id)}
                  >
                    <T>Join Discussion</T>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-edu-card-bg border-none">
        <CardHeader>
          <CardTitle><T>Your Study Network</T></CardTitle>
          <CardDescription className="text-gray-400"><T>Connect with fellow students</T></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-edu-dark/30 rounded-lg flex flex-col items-center">
              <User size={24} className="text-edu-purple mb-2" />
              <h3 className="font-medium text-center"><T>Study Buddies</T></h3>
              <p className="text-xs mb-4 text-gray-400 mt-1"><T>connections</T>: 12</p>
              <Button variant="outline" size="sm" className="mt-2">
                <T>View Network</T>
              </Button>
            </div>
            <div className="p-4 bg-edu-dark/30 rounded-lg flex flex-col items-center">
              <MessageSquare size={24} className="text-edu-purple mb-2" />
              <h3 className="font-medium text-center"><T>Active Chats</T></h3>
              <p className="text-xs text-gray-400 mt-1"><T>ongoing conversations</T>: 3</p>
              <Button variant="outline" size="sm" className="mt-2">
                <T>Open Chats</T>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscussionsTab;
