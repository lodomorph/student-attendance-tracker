import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Section, InsertSection } from "@shared/schema";
import { insertSectionSchema } from "@shared/schema";

function SectionForm({ 
  defaultValues,
  onSubmit,
  isSubmitting 
}: {
  defaultValues?: InsertSection;
  onSubmit: (data: InsertSection) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<InsertSection>({
    resolver: zodResolver(insertSectionSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Section"}
        </Button>
      </form>
    </Form>
  );
}

export default function Sections() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: sections, isLoading } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  const createSection = useMutation({
    mutationFn: async (section: InsertSection) => {
      await apiRequest("POST", "/api/sections", section);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      toast({ title: "Section created successfully" });
    },
  });

  const updateSection = useMutation({
    mutationFn: async ({
      id,
      section,
    }: {
      id: number;
      section: InsertSection;
    }) => {
      await apiRequest("PUT", `/api/sections/${id}`, section);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      toast({ title: "Section updated successfully" });
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      toast({ title: "Section deleted successfully" });
    },
  });

  const filteredSections = sections?.filter((section) =>
    section.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search sections..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <SectionForm
              onSubmit={(data) => createSection.mutate(data)}
              isSubmitting={createSection.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSections?.map((section) => (
            <TableRow key={section.id}>
              <TableCell>{section.name}</TableCell>
              <TableCell>{section.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Section</DialogTitle>
                      </DialogHeader>
                      <SectionForm
                        defaultValues={section}
                        onSubmit={(data) =>
                          updateSection.mutate({ id: section.id, section: data })
                        }
                        isSubmitting={updateSection.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteSection.mutate(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
