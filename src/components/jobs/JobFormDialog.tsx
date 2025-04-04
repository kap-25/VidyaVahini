
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import T from '@/components/T';

type JobFormData = {
  title: string;
  description: string;
  type: string;
  company: string;
  location: string;
  requirements: string;
  application_url: string;
  deadline: string;
};

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: JobFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  editingId: string | null;
}

const JobFormDialog: React.FC<JobFormDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
  editingId,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-edu-card-bg text-white border-edu-card-bg sm:max-w-md max-h-[90vh]">
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <DialogHeader>
            <DialogTitle className='ml-4'>
              {editingId ? <T>Edit Job Material</T> : <T>Add New Job Material</T>}
            </DialogTitle>
            <DialogDescription className="ml-4 text-gray-400">
              <T>Fill in the details for this job opportunity</T>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 p-4 mt-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                <T>Title</T> *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="Job Title"
                className="w-full bg-edu-dark"
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                <T>Type</T> *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={onInputChange}
                className="w-full rounded-md bg-edu-dark px-3 py-2 text-white"
                required
              >
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="hackathon">Hackathon</option>
                <option value="competition">Competition</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-1">
                <T>Company</T> *
              </label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={onInputChange}
                placeholder="Company Name"
                className="w-full bg-edu-dark"
                required
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                <T>Location</T>
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                placeholder="Remote, City, Country, etc."
                className="w-full bg-edu-dark"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                <T>Description</T> *
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="Job Description"
                className="w-full bg-edu-dark min-h-[100px]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium mb-1">
                <T>Requirements</T>
              </label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={onInputChange}
                placeholder="Required skills, qualifications, etc."
                className="w-full bg-edu-dark"
              />
            </div>
            
            <div>
              <label htmlFor="application_url" className="block text-sm font-medium mb-1">
                <T>Application URL</T>
              </label>
              <Input
                id="application_url"
                name="application_url"
                value={formData.application_url}
                onChange={onInputChange}
                placeholder="https://example.com/apply"
                className="w-full bg-edu-dark"
                type="url"
              />
            </div>
            
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium mb-1">
                <T>Deadline</T>
              </label>
              <Input
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={onInputChange}
                className="w-full bg-edu-dark"
                type="date"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-muted"
              >
                <T>Cancel</T>
              </Button>
              <Button 
                type="submit" 
                className="bg-edu-purple hover:bg-edu-purple-dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <T>Processing...</T>
                  </>
                ) : (
                  <T>{editingId ? 'Update' : 'Submit'}</T>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default JobFormDialog;
