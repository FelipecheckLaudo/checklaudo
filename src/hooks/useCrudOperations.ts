import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";

interface CrudOperationsConfig<T> {
  getFn: () => Promise<T[]>;
  saveFn: (data: any) => Promise<T>;
  updateFn: (id: string, data: any) => Promise<T>;
  deleteFn: (id: string) => Promise<void>;
}

/**
 * Custom hook for unified CRUD operations
 * Reduces boilerplate code for data management
 */
export function useCrudOperations<T extends { id: string }>({
  getFn,
  saveFn,
  updateFn,
  deleteFn,
}: CrudOperationsConfig<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getFn();
      setData(result);
    } catch (error: any) {
      toast.error(getUserFriendlyError(error));
    } finally {
      setIsLoading(false);
    }
  }, [getFn]);

  const save = useCallback(async (itemData: any): Promise<T | null> => {
    try {
      setIsSaving(true);
      const result = await saveFn(itemData);
      await loadData();
      toast.success("Item cadastrado!");
      return result;
    } catch (error: any) {
      toast.error(getUserFriendlyError(error));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [saveFn, loadData]);

  const update = useCallback(async (id: string, itemData: any): Promise<T | null> => {
    try {
      setIsSaving(true);
      const result = await updateFn(id, itemData);
      await loadData();
      toast.success("Item atualizado!");
      return result;
    } catch (error: any) {
      toast.error(getUserFriendlyError(error));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [updateFn, loadData]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteFn(id);
      await loadData();
      toast.success("Item excluído!");
      return true;
    } catch (error: any) {
      toast.error(getUserFriendlyError(error));
      return false;
    }
  }, [deleteFn, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    isSaving,
    loadData,
    save,
    update,
    remove,
  };
}
