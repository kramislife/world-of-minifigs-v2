const LoadingSpinner = ({ minHeight = "min-h-[200px]", size = "h-12 w-12" }) => {
  return (
    <div className={`flex justify-center items-center ${minHeight}`}>
      <div className={`animate-spin rounded-full ${size} border-b-2 border-accent`}></div>
    </div>
  );
};

export default LoadingSpinner;
