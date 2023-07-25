import { Button, Dialog, DialogBody, DialogFooter } from '@material-tailwind/react';

type Props = {
   open: boolean;
   setOpen: (open: boolean) => void;
   action: () => void;
}

const DeleteDialog = ({open, setOpen, action}: Props) => {
  return (
   <Dialog
   size="xs"
   open={open}
   handler={() => setOpen(false)}
>
   <DialogBody>
      Are you sure you want to remove these users from the quiz?
   </DialogBody>
   <DialogFooter>
      <Button
         variant="text"
         color="blue"
         onClick={() => setOpen(false)}
         className="mr-5"
      >
         <span>Cancel</span>
      </Button>
      <Button
         variant="gradient"
         color="red"
         onClick={() => {
            action();
            setOpen(false);
         }}
      >
         <span>Remove</span>
      </Button>
   </DialogFooter>
</Dialog>
  )
}

export default DeleteDialog